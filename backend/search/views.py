import math

from django.contrib.auth.models import User
from django.db.models import Q
from rest_framework.authentication import TokenAuthentication
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import Post
from .serializers import AccountSerializer, PostSerializer

RESULT_LIMIT = 20
DEFAULT_RADIUS_KM = 5
MAX_RADIUS_KM = 50


def distance_km(lat1, lng1, lat2, lng2):
    """Do points ke beech ki doori (haversine formula), km mein."""
    r = 6371
    d_lat = math.radians(lat2 - lat1)
    d_lng = math.radians(lng2 - lng1)
    a = (math.sin(d_lat / 2) ** 2
         + math.cos(math.radians(lat1)) * math.cos(math.radians(lat2)) * math.sin(d_lng / 2) ** 2)
    return 2 * r * math.asin(math.sqrt(a))


def filter_posts_by_text(queryset, q):
    if not q:
        return queryset
    return queryset.filter(
        Q(title__icontains=q) | Q(description__icontains=q) | Q(category__icontains=q)
    )


class SearchView(APIView):
    """
    GET /api/search/?q=road&type=posts
    GET /api/search/?q=ram&type=accounts
    GET /api/search/?q=garbage&type=near&lat=23.34&lng=85.30&radius=5
    Header: Authorization: Token <token>
    """
    authentication_classes = [TokenAuthentication]
    permission_classes = [IsAuthenticated]

    def get(self, request):
        q = request.query_params.get('q', '').strip()
        tab = request.query_params.get('type', 'posts')

        if tab == 'accounts':
            return self.search_accounts(q)
        if tab == 'near':
            return self.search_near(request, q)
        return self.search_posts(q)

    def search_posts(self, q):
        posts = filter_posts_by_text(Post.objects.select_related('created_by'), q)
        posts = list(posts.order_by('-created_at')[:RESULT_LIMIT])
        return Response({
            'type': 'posts',
            'count': len(posts),
            'results': PostSerializer(posts, many=True).data,
        })

    def search_accounts(self, q):
        if not q:
            return Response({'type': 'accounts', 'count': 0, 'results': []})

        users = User.objects.filter(
            Q(username__icontains=q) | Q(first_name__icontains=q) | Q(last_name__icontains=q),
            is_active=True,
        ).order_by('username')[:RESULT_LIMIT]
        users = list(users)
        return Response({
            'type': 'accounts',
            'count': len(users),
            'results': AccountSerializer(users, many=True).data,
        })

    def search_near(self, request, q):
        try:
            lat = float(request.query_params.get('lat'))
            lng = float(request.query_params.get('lng'))
            radius = float(request.query_params.get('radius', DEFAULT_RADIUS_KM))
        except (TypeError, ValueError):
            return Response({'error': 'lat aur lng sahi number hone chahiye'}, status=400)

        radius = min(max(radius, 0.1), MAX_RADIUS_KM)

        # pehle chhota box (DB mein), phir exact doori Python mein
        delta_lat = radius / 111.0
        delta_lng = radius / (111.0 * max(math.cos(math.radians(lat)), 0.01))
        posts = Post.objects.select_related('created_by').filter(
            latitude__range=(lat - delta_lat, lat + delta_lat),
            longitude__range=(lng - delta_lng, lng + delta_lng),
        )
        posts = filter_posts_by_text(posts, q)

        nearby = []
        for post in posts:
            d = distance_km(lat, lng, post.latitude, post.longitude)
            if d <= radius:
                nearby.append((d, post))
        nearby.sort(key=lambda item: item[0])

        results = []
        for d, post in nearby[:RESULT_LIMIT]:
            item = PostSerializer(post).data
            item['distance_km'] = round(d, 2)
            results.append(item)

        return Response({'type': 'near', 'count': len(results), 'results': results})
