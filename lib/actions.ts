'use server';

import { supabase } from '@/lib/supabase';
import { shuffleForSecretSanta } from '@/lib/shuffle';

// =====================================================
// EVENT ACTIONS
// =====================================================

export async function createEvent(name?: string) {
  const { data, error } = await supabase
    .from('events')
    .insert({ name: name || 'Secret Santa Event' })
    .select()
    .single();

  if (error) {
    console.error('Error creating event:', error);
    return { error: error.message };
  }

  return { data };
}

export async function getEvent(shortCode: string) {
  const { data, error } = await supabase
    .from('events')
    .select('*')
    .eq('short_code', shortCode)
    .single();

  if (error) {
    console.error('Error fetching event:', error);
    return { error: error.message };
  }

  return { data };
}

export async function lockEvent(eventId: string, adminToken: string) {
  // Verify admin token
  const { data: event } = await supabase
    .from('events')
    .select('admin_token')
    .eq('id', eventId)
    .single();

  if (!event || event.admin_token !== adminToken) {
    return { error: 'Unauthorized' };
  }

  const { error } = await supabase
    .from('events')
    .update({ locked: true })
    .eq('id', eventId);

  if (error) {
    return { error: error.message };
  }

  return { success: true };
}

export async function resetEvent(eventId: string, adminToken: string) {
  // Verify admin token
  const { data: event } = await supabase
    .from('events')
    .select('admin_token')
    .eq('id', eventId)
    .single();

  if (!event || event.admin_token !== adminToken) {
    return { error: 'Unauthorized' };
  }

  // Delete all assignments for this event
  await supabase
    .from('assignments')
    .delete()
    .eq('event_id', eventId);

  // Delete all wishlists for participants in this event
  const { data: participants } = await supabase
    .from('participants')
    .select('id')
    .eq('event_id', eventId);

  if (participants) {
    for (const p of participants) {
      await supabase
        .from('wishlists')
        .delete()
        .eq('participant_id', p.id);
    }
  }

  // Delete all participants
  await supabase
    .from('participants')
    .delete()
    .eq('event_id', eventId);

  // Unlock event
  await supabase
    .from('events')
    .update({ locked: false })
    .eq('id', eventId);

  return { success: true };
}

// =====================================================
// PARTICIPANT ACTIONS
// =====================================================

export async function getParticipants(eventId: string) {
  const { data, error } = await supabase
    .from('participants')
    .select('*')
    .eq('event_id', eventId)
    .order('created_at', { ascending: true });

  if (error) {
    return { error: error.message };
  }

  return { data: data || [] };
}

export async function addParticipant(eventId: string, name: string) {
  // Check if event is locked
  const { data: event } = await supabase
    .from('events')
    .select('locked')
    .eq('id', eventId)
    .single();

  if (event?.locked) {
    return { error: 'Event is locked. No new participants can join.' };
  }

  // Check for duplicate name
  const { data: existing } = await supabase
    .from('participants')
    .select('id')
    .eq('event_id', eventId)
    .eq('name', name.trim())
    .single();

  if (existing) {
    return { error: 'A participant with this name already exists.' };
  }

  const { data, error } = await supabase
    .from('participants')
    .insert({ event_id: eventId, name: name.trim() })
    .select()
    .single();

  if (error) {
    return { error: error.message };
  }

  return { data };
}

export async function getParticipantByName(eventId: string, name: string) {
  const { data, error } = await supabase
    .from('participants')
    .select('*')
    .eq('event_id', eventId)
    .eq('name', name.trim())
    .single();

  if (error) {
    return { error: error.message };
  }

  return { data };
}

export async function adminAddParticipant(eventId: string, name: string, adminToken: string) {
  // Verify admin token
  const { data: event } = await supabase
    .from('events')
    .select('admin_token, locked')
    .eq('id', eventId)
    .single();

  if (!event || event.admin_token !== adminToken) {
    return { error: 'Unauthorized' };
  }

  if (event.locked) {
    return { error: 'Event is locked. No new participants can be added.' };
  }

  // Check for duplicate name
  const { data: existing } = await supabase
    .from('participants')
    .select('id')
    .eq('event_id', eventId)
    .eq('name', name.trim())
    .single();

  if (existing) {
    return { error: 'A participant with this name already exists.' };
  }

  const { data, error } = await supabase
    .from('participants')
    .insert({ event_id: eventId, name: name.trim() })
    .select()
    .single();

  if (error) {
    return { error: error.message };
  }

  return { data };
}

export async function removeParticipant(eventId: string, participantId: string, adminToken: string) {
  // Verify admin token
  const { data: event } = await supabase
    .from('events')
    .select('admin_token, locked')
    .eq('id', eventId)
    .single();

  if (!event || event.admin_token !== adminToken) {
    return { error: 'Unauthorized' };
  }

  if (event.locked) {
    return { error: 'Event is locked. Participants cannot be removed.' };
  }

  const { error } = await supabase
    .from('participants')
    .delete()
    .eq('id', participantId)
    .eq('event_id', eventId);

  if (error) {
    return { error: error.message };
  }

  return { success: true };
}

// =====================================================
// ASSIGNMENT ACTIONS
// =====================================================

export async function generateAssignments(eventId: string, adminToken: string) {
  // Verify admin token
  const { data: event } = await supabase
    .from('events')
    .select('admin_token, locked')
    .eq('id', eventId)
    .single();

  if (!event || event.admin_token !== adminToken) {
    return { error: 'Unauthorized' };
  }

  if (event.locked) {
    return { error: 'Assignments already generated' };
  }

  // Get all participants
  const { data: participants } = await supabase
    .from('participants')
    .select('*')
    .eq('event_id', eventId)
    .order('created_at', { ascending: true });

  if (!participants || participants.length < 3) {
    return { error: 'Need at least 3 participants' };
  }

  // Use the existing shuffle algorithm
  const participantIds = participants.map(p => p.id);
  const shuffled = shuffleForSecretSanta(participantIds);

  // Create assignments: each person gives to the next in shuffled array
  const assignments = participantIds.map((giverId, index) => ({
    event_id: eventId,
    giver_id: giverId,
    receiver_id: shuffled[index],
  }));

  // Insert assignments
  const { error: insertError } = await supabase
    .from('assignments')
    .insert(assignments);

  if (insertError) {
    return { error: insertError.message };
  }

  // Lock the event
  await supabase
    .from('events')
    .update({ locked: true })
    .eq('id', eventId);

  return { success: true };
}

export async function getMyAssignment(eventId: string, participantId: string) {
  // Get the assignment where this participant is the giver
  const { data: assignment, error } = await supabase
    .from('assignments')
    .select('*, receiver:receiver_id(id, name)')
    .eq('event_id', eventId)
    .eq('giver_id', participantId)
    .single();

  if (error || !assignment) {
    return { error: 'Assignment not found' };
  }

  return { data: assignment };
}

// =====================================================
// WISHLIST ACTIONS
// =====================================================

export async function getWishlist(participantId: string) {
  const { data, error } = await supabase
    .from('wishlists')
    .select('*')
    .eq('participant_id', participantId)
    .order('created_at', { ascending: true });

  if (error) {
    return { error: error.message };
  }

  return { data: data || [] };
}

export async function addWishlistItem(participantId: string, item: string) {
  const { data, error } = await supabase
    .from('wishlists')
    .insert({ participant_id: participantId, item: item.trim() })
    .select()
    .single();

  if (error) {
    return { error: error.message };
  }

  return { data };
}

export async function removeWishlistItem(itemId: string) {
  const { error } = await supabase
    .from('wishlists')
    .delete()
    .eq('id', itemId);

  if (error) {
    return { error: error.message };
  }

  return { success: true };
}

// =====================================================
// COMBINED DATA FETCHING
// =====================================================

export async function getEventData(shortCode: string) {
  // Fetch event by short_code
  const { data: event, error: eventError } = await supabase
    .from('events')
    .select('*')
    .eq('short_code', shortCode)
    .single();

  if (eventError || !event) {
    return { error: 'Event not found' };
  }

  // Fetch participants using the event's UUID
  const { data: participants } = await supabase
    .from('participants')
    .select('*')
    .eq('event_id', event.id)
    .order('created_at', { ascending: true });

  return {
    data: {
      event,
      participants: participants || [],
    }
  };
}

export async function getAdminOverview(eventId: string, adminToken: string) {
  // Verify admin token
  const { data: event } = await supabase
    .from('events')
    .select('admin_token')
    .eq('id', eventId)
    .single();

  if (!event || event.admin_token !== adminToken) {
    return { error: 'Unauthorized' };
  }

  // Fetch participants with wishlist counts
  const { data: participants } = await supabase
    .from('participants')
    .select('id, name, created_at')
    .eq('event_id', eventId)
    .order('created_at', { ascending: true });

  if (!participants) {
    return { data: { participants: [] } };
  }

  // Get wishlist counts for each participant
  const participantsWithDetails = await Promise.all(
    participants.map(async (p) => {
      const { count } = await supabase
        .from('wishlists')
        .select('*', { count: 'exact', head: true })
        .eq('participant_id', p.id);

      return {
        id: p.id,
        name: p.name,
        wishlistCount: count || 0,
        joinedAt: p.created_at,
      };
    })
  );

  return { data: { participants: participantsWithDetails } };
}
