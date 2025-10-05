import { Handler, schedule } from '@netlify/functions';
import { createClient } from '@supabase/supabase-js';

const handler: Handler = async () => {
  try {
    const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
    const supabaseKey = process.env.VITE_SUPABASE_PUBLISHABLE_DEFAULT_KEY || process.env.SUPABASE_KEY;
    
    if (!supabaseUrl || !supabaseKey) {
      throw new Error('Supabase credentials are missing');
    }

    const supabase = createClient(supabaseUrl, supabaseKey);
    
    await supabase.from('couples').select('count').limit(1).single();
    
    const otherProjects = process.env.OTHER_PROJECT_URLS?.split(',') || [];
    
    const fetchPromises = otherProjects
      .filter(url => url.trim())
      .map(url => 
        fetch(url.trim())
          .then(() => ({ url, status: 'success' }))
          .catch(() => ({ url, status: 'failed' }))
      );
    
    const otherProjectsResults = await Promise.all(fetchPromises);
    
    return {
      statusCode: 200,
      body: JSON.stringify({
        success: true,
        timestamp: new Date().toISOString(),
        otherProjects: otherProjectsResults
      })
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      })
    };
  }
};

export { handler };
export const config = schedule('0 0 * * 0');
