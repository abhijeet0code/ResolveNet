import logging
import math

from django.db.models import Q
from pgvector.django import CosineDistance
from rest_framework.authentication import TokenAuthentication
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from accounts.authentication import SupabaseAuthentication
from accounts.models import Profile
from accounts.utils import get_embedding
from posts.models import Post
from posts.serializers import PostSerializer
from .serializers import ProfileSearchSerializer

logger = logging.getLogger(__name__)

RESULT_LIMIT = 20
DEFAULT_RADIUS_KM = 5
MAX_RADIUS_KM = 50
SIMILARITY_MAX_DISTANCE = 0.6   # chhota = strict, bada = zyada loose results
MIN_SIMILAR_QUERY_LEN = 3


def distance_km(lat1, lng1, lat2, lng2):
    """Do points ke beech ki doori (haversine formula), km mein."""
    r = 6371
    d_lat = math.radians(lat2 - lat1)
    d_lng = math.radians(lng2 - lng1)
    a = (math.sin(d_lat / 2) ** 2
         + math.cos(math.radians(lat1)) * math.cos(math.radians(lat2)) * math.sin(d_lng / 2) ** 2)
    return 2 * r * math.asin(math.sqrt(a))


def published_posts():
    """Feed wale real posts (jo log feed me dekhte hain)."""
    return (
        Post.objects.filter(status=Post.Status.PUBLISHED)
        .select_related('author__profile')
        .prefetch_related('media')
    )


def filter_posts_by_text(queryset, q):
    if not q:
        return queryset
    return queryset.filter(
        Q(caption__icontains=q)
        | Q(city__icontains=q)
        | Q(state__icontains=q)
        | Q(location_name__icontains=q)
    )


class SearchView(APIView):
    """
    GET /api/search/?q=road&type=posts
    GET /api/search/?q=ram&type=accounts
    GET /api/search/?q=garbage&type=near&lat=23.34&lng=85.30&radius=5
    Header: Authorization: Token <token>
    """
    authentication_classes = [TokenAuthentication, SupabaseAuthentication]
    permission_classes = [IsAuthenticated]

    def get(self, request):
        q = request.query_params.get('q', '').strip()
        tab = request.query_params.get('type', 'posts')

        if tab == 'accounts':
            return self.search_accounts(q)
        if tab == 'near':
            return self.search_near(request, q)
        return self.search_posts(request, q)

    def search_posts(self, request, q):
        posts = filter_posts_by_text(published_posts(), q)
        posts = list(posts.order_by('-created_at')[:RESULT_LIMIT])
        return Response({
            'type': 'posts',
            'count': len(posts),
            'results': PostSerializer(posts, many=True, context={'request': request}).data,
        })

    def search_accounts(self, q):
        if not q:
            return Response({'type': 'accounts', 'count': 0, 'results': []})

        # embedding list me load hi nahi karni (heavy hai)
        base = Profile.objects.defer('embedding').filter(
            username__isnull=False, user__is_active=True
        )

        # 1) pehle exact text match: username / full_name
        text_matches = list(
            base.filter(Q(username__icontains=q) | Q(full_name__icontains=q))
            .order_by('username')[:RESULT_LIMIT]
        )
        results = []
        for p in text_matches:
            item = ProfileSearchSerializer(p).data
            item['match'] = 'text'
            results.append(item)

        # 2) bachi hui jagah me embedding se similar profiles
        remaining = RESULT_LIMIT - len(results)
        if remaining > 0 and len(q) >= MIN_SIMILAR_QUERY_LEN:
            try:
                query_vector = get_embedding(q)
                similar = (
                    base.exclude(pk__in=[p.pk for p in text_matches])
                    .filter(embedding__isnull=False)
                    .annotate(distance=CosineDistance('embedding', query_vector))
                    .filter(distance__lt=SIMILARITY_MAX_DISTANCE)
                    .order_by('distance')[:remaining]
                )
                for p in similar:
                    item = ProfileSearchSerializer(p).data
                    item['match'] = 'similar'
                    item['distance'] = round(p.distance, 3)
                    results.append(item)
            except Exception:
                # embedding fail ho to bhi text results mil jayenge
                logger.exception("Similar account search failed")

        return Response({'type': 'accounts', 'count': len(results), 'results': results})

    def search_near(self, request, q):
        try:
            lat = float(request.query_params.get('lat'))
            lng = float(request.query_params.get('lng'))
            radius = float(request.query_params.get('radius', DEFAULT_RADIUS_KM))
        except (TypeError, ValueError):
            return Response({'error': 'lat aur lng sahi number hone chahiye'}, status=400)

        radius = min(max(radius, 0.1), MAX_RADIUS_KM)

        # pehle ek chhota box (database me), phir sahi doori python me
        delta_lat = radius / 111.0
        delta_lng = radius / (111.0 * max(math.cos(math.radians(lat)), 0.01))
        posts = published_posts().filter(
            latitude__range=(lat - delta_lat, lat + delta_lat),
            longitude__range=(lng - delta_lng, lng + delta_lng),
        )
        posts = filter_posts_by_text(posts, q)

        nearby = []
        for post in posts:
            # Post me latitude/longitude Decimal hain, haversine ke liye float chahiye
            d = distance_km(lat, lng, float(post.latitude), float(post.longitude))
            if d <= radius:
                nearby.append((d, post))
        nearby.sort(key=lambda item: item[0])

        results = []
        for d, post in nearby[:RESULT_LIMIT]:
            item = PostSerializer(post, context={'request': request}).data
            item['distance_km'] = round(d, 2)
            results.append(item)

        return Response({'type': 'near', 'count': len(results), 'results': results})