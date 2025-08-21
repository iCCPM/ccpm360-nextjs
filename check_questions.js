import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://veanktjlvtrycfvhlasn.supabase.co';
const supabaseKey =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZlYW5rdGpsdnRyeWNmdmhsYXNuIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NDcwNDU5MiwiZXhwIjoyMDcwMjgwNTkyfQ.7B56PHswa_-4RfoUJncqpj2NyVS8PnvO1xnSMFhKmp0';

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkQuestions() {
  try {
    const { data, error } = await supabase
      .from('assessment_questions')
      .select('id, question_text, options')
      .limit(3);

    if (error) {
      console.error('Error:', error);
      return;
    }

    console.log('Assessment Questions Data:');
    data.forEach((question, index) => {
      console.log(`\n--- Question ${index + 1} ---`);
      console.log('ID:', question.id);
      console.log('Question:', question.question_text);
      console.log('Options:', JSON.stringify(question.options, null, 2));
    });
  } catch (err) {
    console.error('Unexpected error:', err);
  }
}

checkQuestions();
