import { getEventData } from '@/lib/actions';
import { notFound } from 'next/navigation';
import EventPageClient from '@/components/EventPageClient';

type Props = {
  params: Promise<{ eventId: string }>;
};

export default async function EventPage({ params }: Props) {
  const { eventId } = await params;
  
  // Validate UUID format
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  if (!uuidRegex.test(eventId)) {
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
