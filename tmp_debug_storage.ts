import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://mngjmenbzedhcjunljpc.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1uZ2ptZW5iemVkaGNqdW5sanBjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzM1NjkzODksImV4cCI6MjA4OTE0NTM4OX0.rZdBplEIPzv3062y7gaGY1q0M6hzfXLsiyslwdLU0jo';

const supabase = createClient(supabaseUrl, supabaseKey);

async function main() {
  const { data: buckets, error: bError } = await supabase.storage.listBuckets();
  if (bError) {
    console.error('Error listing buckets:', bError);
    return;
  }
  console.log('Buckets:', buckets.map(b => ({ name: b.name, public: b.public })));

  const { data: files, error: fError } = await supabase.storage.from('avatars').list('avatars');
  if (fError) {
    console.error('Error listing files in avatars/avatars:', fError);
  } else {
    console.log('Files in avatars/avatars (first 5):', files.slice(0, 5).map(f => f.name));
  }
}

main().catch(console.error);
