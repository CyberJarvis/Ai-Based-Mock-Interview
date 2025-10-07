import React from 'react'
import { Button } from "@/components/ui/button";
import { useRouter } from 'next/navigation';

const InterviewItemCard = ({interview}) => {

    const router = useRouter()
    const onStart = ()=>{
        router.push("/dashboard/interview/"+interview?.mockId)
    }
    const onFeedback = ()=>{
        router.push("/dashboard/interview/"+interview?.mockId+"/feedback")
    }
  return (
    <div className="border border-gray-500 shadow-sm rounded-lg p-3" >
        <h2 className='font-bold text-primary' >{interview?.jobPosition}</h2>
        <h2 className='text-sm text-gray-600' >{interview?.jobExperience} Years of experience</h2>
        <h2 className="text-xs text-gray-400" >Created At: {interview.createdAt}</h2>
        
        {interview?.resumeFileName && (
          <div className="mt-2 mb-2">
            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
              📄 Resume-based
            </span>
          </div>
        )}

        <div className='flex justify-between mt-2 gap-5 ' >
            <Button onClick={onFeedback} size="sm"  className="w-full" >Feedback</Button>
            <Button onClick={onStart} size="sm"  className="w-full">Start</Button>
        </div>
    </div>

  )
}

export default InterviewItemCard