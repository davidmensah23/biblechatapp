import { SUPABASE_URL } from './supabase';

const EDGE_FUNCTION_URL = `${SUPABASE_URL}/functions/v1/youversion`;

export interface YouVersionVOTD {
  day: number;
  passage_id: string;
}

/**
 * Fetch official YouVersion Verse of the Day via secure Supabase Edge Function
 */
export const fetchYouVersionVerseOfTheDay = async (
  dayOfYear?: number
): Promise<YouVersionVOTD | null> => {
  try {
    const url = dayOfYear
      ? `${EDGE_FUNCTION_URL}?action=votd&day=${dayOfYear}`
      : `${EDGE_FUNCTION_URL}?action=today`;

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
    });

    if (!response.ok) {
      console.warn('YouVersion Edge Function returned status:', response.status);
      return null;
    }

    const json = await response.json();
    if (json.success && json.data) {
      return json.data as YouVersionVOTD;
    }
    return null;
  } catch (err) {
    console.warn('Error calling YouVersion Edge Function:', err);
    return null;
  }
};

/**
 * Fetch available Bible versions from YouVersion
 */
export const fetchYouVersionBibles = async (): Promise<any[] | null> => {
  try {
    const response = await fetch(`${EDGE_FUNCTION_URL}?action=bibles`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
    });

    if (!response.ok) return null;
    const json = await response.json();
    return json.success ? json.data : null;
  } catch (err) {
    console.warn('Error fetching YouVersion bibles:', err);
    return null;
  }
};
