import { getEventData } from '@/lib/actions';
import { notFound } from 'next/navigation';
import EventPageClient from '@/components/EventPageClient';

type Props = {
  params: Promise<{ eventId: string }>;
};

export default async function EventPage({ params }: Props) {
  const { eventId } = await params;
  
  // Validate short code format (8 alphanumeric characters)
  const shortCodeRegex = /^[A-Za-z0-9]{6,12}$/;
  if (!shortCodeRegex.test(eventId)) {
    notFound();
  }

  const { data, error } = await getEventData(eventId);

  if (error || !data) {
    notFound();
  }

  return (
    <EventPageClient 
      eventId={eventId}
      initialEvent={data.event}
      initialParticipants={data.participants}
    />
  );
}
