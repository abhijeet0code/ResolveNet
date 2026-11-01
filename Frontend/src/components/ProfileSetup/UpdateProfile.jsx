import SpotlightCard from '../animation/SpotlightCard'
import React, { useEffect, useRef, useState } from "react"
import { useForm } from "react-hook-form"
import { useDispatch } from "react-redux"
import { useNavigate } from "react-router-dom"
import axiosInstance from '../../config/axiosInstance'
import resolve from '../../assets/ResolveNet-favicon-white-detail.png'
import { loggedUser } from "../../features/auth/state/authAction"
import {
  Camera,
  User,
  X,
  LoaderCircle,
  CheckCircle2,
  AlertCircle,
  Axis3D,
} from "lucide-react";


const MAX_AVATAR_SIZE = 5 * 1024 * 1024;
const ALLOWED_IMAGE_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
];


const UpdateProfile = () => {
  
const steps = [

  {
    key: "full_name",
    kind: "field",
    field: "full_name",
    title: "Your Name",
    subtitle: "Let's get started.",
    placeholder: "Enter your full name",
    required: true,
  },
  {
    key: "username",
    kind: "field",
    field: "username",
    title: "Username",
    subtitle: "This will be your identity on ResolveNet.",
    placeholder: "Enter username",
    required: true,
  },
  {
    key: "phone",
    kind: "field",
    field: "phone",
    title: "Enter Your Mobile Number",
    subtitle: "We'll use this to keep your account secure.",
    placeholder: "Enter mobile number",
    required: true,
  },
  {
    key: "city",
    kind: "field",
    field: "city",
    title: "Which City Are You In?",
    subtitle: "Helps us show issues relevant to you.",
    placeholder: "Enter your city",
    required: true,
  },
  {
    key: "state",
    kind: "field",
    field: "state",
    title: "Which State?",
    subtitle: "Just to narrow things down further.",
    placeholder: "Enter your state",
    required: true,
  },
  {
    key: "occupation",
    kind: "choice",
    field:"occupation",
    title:"Who are you ?",
    subtitle:"Tell us more about yourself.",
    required: false,
  },
  {
    key: "bio",
    kind: "textarea",
    field: "bio",
    title: "Tell Us About Yourself",
    subtitle: "Optional — you can skip this.",
    placeholder: "A short line about yourself",
    required: false,
  },
  
  {
    key: "avatar",
    kind: "avatar",
    title: "Add a Profile Photo",
    required: false,
  },
]



  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [currentAvatarUrl, setCurrentAvatarUrl] = useState("")
  const [profile, setProfile] = useState(null)
  const [avatarFile, setAvatarFile] = useState(null);
  const [localPreviewUrl, setLocalPreviewUrl] = useState("")

  const [loadingInitial, setLoadingInitial] = useState(true)
  const [submitting, setSubmitting] = useState(false)

  const [serverError, setServerError] = useState("")
  const [successMessage, setSuccessMessage] = useState("")

  const {
    register,
    reset,
    handleSubmit,
    formState: { errors },
  } = useForm({
    defaultValues: {
      full_name: "",
      username: "",
      phone: "",
      city: "",
      state: "",
      bio: "",
    },
  });


  // 1 Let's fetch the existing profile 



  useEffect (() => {
    let isMounted=true

    const loadProfile = async () => {
      try {
        const response = await axiosInstance.get("/api/auth/profile/")

        if (isMounted) {
          setProfile(response.data)

        }
        if(!isMounted) return

        reset({
          full_name: profile.full_name || "",
          username: profile.username || "",
          phone: profile.phone || "",
          city: profile.city || "",
          state: profile.state || "",
          occupation: profile.occupation || "",
          bio: profile.bio || "",
        })

        setCurrentAvatarUrl(profile.avatar_url || "")
      } catch (error){
      if (isMounted)
        {
          setServerError("Couldn't load your profle, Please try again")
        } 
    } finally {
      if (isMounted){
        setLoadingInitial(false)
      }
    }

    } 

    loadProfile()

    return () => {
      isMounted=false
    }
  },[reset])
  

  // 2 Creating and cleaning up local image preview

  useEffect(() => {
    if (!avatarFile) {
      setLocalPreviewUrl("");
      return;
    }

    const objectUrl = URL.createObjectURL(avatarFile);

    setLocalPreviewUrl(objectUrl);

    return () => {
      URL.revokeObjectURL(objectUrl);
    };

  }, [avatarFile]);


  // 3 Taking and handling the image selection

  const handleAvatarChnage = (e) => {
    const file = e.target.files?.[0]


    if (!file) return;

    setServerError("")
    setSuccessMessage("Image uploaded")

    // Checking the image format
    if(!ALLOWED_IMAGE_TYPES.includes(file.type)){
      serverError("Please select a JPG, PNG or  WEBP image only.")
      e.target.value=''
      return
    } 

    //Checking the file size 

    if (file.size>MAX_AVATAR_SIZE){
    setServerError("Your Image should be less than 5 MB. ")

    e.target.value=''
    return
  }
    setAvatarFile(file)
  }

  const cancelAvatarChange = () => {
    setAvatarFile(null);

    // Allow selecting the same file again later
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }

    setServerError("");
  };

  
  
  return (
    <div className=' w-full h-full grid items-center justify-center mt-40'>
        <SpotlightCard
          theme="gray"
          intensity={0.80}
          spotlightSize={250}
          softness={0.7}
          shape="circle"
          borderGlow={0.2}
          proximity={50}
          smoothing={0.1}
          grain={0}
          ambient={false}
          flare
          className=' grid items-center '
        >
          <div className=' text-2xl text-primary font-semibold my-10 hover:text-primary/90'>
            <h1>Edit Profile</h1>
          </div>

          <div className='w-70 h-33 md:w-140 bg-surface/90 flex mb-8 items-center mx-2   rounded-2xl '>
            <div className='w-25 h-25 overflow-hidden mx-5 rounded-full object-center'>
              <img src={resolve} alt="" className=' w-full h-full object-cover '/>
            </div>
            <div className='mx-3'>
              <h3 className='text-lg font-semibold '>@resolvenet</h3>
              <h4 className='text-base text-gray-600 ml-2'>Resolve Net</h4>
            </div>
            <button className=' transition-transform duration-300 hover:scale-105 bg-green-950 rounded-2xl h-12 p-3 ml-25 text-sm text-white/100 '
            >
              Edit Profile Picture
            </button>


          </div>
          {steps.map((step)=>(
            
            step.kind === 'field' ? (
              <>
              <p className="text-sm text-text-secondary mx-3 mb-2">{step.title}</p>
              <input type="text" 
               key={step.key}
               placeholder={step.placeholder}  
               className='block  md:w-140 w-70 h-15 px-3 2 mb-5 bg-white
                 border border-transparent
                 rounded-xl
                 px-4 py-3
                 text-sm text-gray-900
                 placeholder:text-gray-400
                 outline-none
                 transition-all duration-200
                 focus:bg-screen
                 focus:border-green-900
                 focus:ring-4 focus:ring-green-900/5' />
                 </>
            ) : step.kind == "textarea" ? (
              <textarea type="textarea" 
              rows={5}
               key={step.key}
               placeholder={step.placeholder}  
               className='block  md:w-140 w-70 h-40 px-3 2 m-7 bg-white
                 border border-transparent
                 rounded-xl
                 px-4 py-3
                 text-sm text-gray-900
                 placeholder:text-gray-400
                 outline-none
                 transition-all duration-200
                 focus:bg-screen
                 focus:border-green-900
                 focus:ring-4 focus:ring-green-900/5' />
            ) : null
            

            

          ))}
          
         
          
        </SpotlightCard>
        
    </div>


  )
}

export default UpdateProfile
