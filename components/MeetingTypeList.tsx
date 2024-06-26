'use client'
import HomeCard from '@/components/HomeCard'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import MeetingModal from './MeetingModal'
import { useUser } from '@clerk/nextjs'
import { Call, useStreamVideoClient } from '@stream-io/video-react-sdk'

import { useToast } from "@/components/ui/use-toast";

const MeetingTypeList = () => {
  const route = useRouter();
  const [meetingState, setMeetingState] = useState<
    'isScheduleMeeting' | 'isJoiningMeeting' | 'isInstantMeeting' | undefined
  >()

  const {user} = useUser();
  const client = useStreamVideoClient();
  const [values, setValues] = useState({
    dateTime: new Date(),
    description: '',
    link: ''
  })
  const [callDetails, setCallDetails] = useState<Call>()
  const {toast } = useToast()

  const createMeeting = async ()=>{
    if(!user || !client) return;

    try {
      if(!values.dateTime){
        toast({title:"Please select time"});
        return;
      }
      const id = crypto.randomUUID();
      const call = client.call('default', id);
      if(!call) throw new Error("Failed to start call");

      const startsAt = values.dateTime.toISOString() || new Date(Date.now()).toISOString();
      const description = values.description || 'Instant Meeting';

      await call.getOrCreate({
        data: {
          starts_at:startsAt,
          custom: {
            description
          }
        }
      })
      setCallDetails(call);
      if(!values.description) {
        route.push(`/meeting/${call.id}`)
      }
      toast({title:"Meeting Created"})

    } catch (error) {
      console.log(error)
      toast({
        title: "Failed to create meeting"
      })
    }
  }

  return (
    <section className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-4">
      <HomeCard
        img="/icons/add-meeting.svg"
        title="New Meeting"
        description="Start an instant meeting"
        handleClick={() => setMeetingState('isInstantMeeting')}
        className='bg-orange-1'
      />
      <HomeCard
        img="/icons/schedule.svg"
        title="Schedule a meeting"
        description="Plan your meeting"
        handleClick={() => setMeetingState('isScheduleMeeting')}
        className='bg-blue-1'
      />
      <HomeCard
        img="/icons/recordings.svg"
        title="View Recordings"
        description="Check your recordings"
        handleClick={() => setMeetingState('isJoiningMeeting')}
        className='bg-purple-1'
      />
      <HomeCard
        img="/icons/join-meeting.svg"
        title="Join Meeting"
        description="Via invitation link"
        handleClick={() => setMeetingState('isJoiningMeeting')}
        className='bg-yellow-1'
      />
      <MeetingModal
      isOpen={meetingState==='isInstantMeeting'}
      onClose={()=>setMeetingState(undefined)}
      title="Start an Instant Meeting"
      className="text-center"
      buttonText="Start Meeting"
      handleClick={createMeeting}
      />
    </section>
  )
}

export default MeetingTypeList
