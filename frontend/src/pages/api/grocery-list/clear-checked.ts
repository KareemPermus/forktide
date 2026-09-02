import type { NextApiRequest, NextApiResponse } from 'next';
import { getDb, isSupabase } from '@/lib/db';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'DELETE') {
    res.setHeader('Allow', 'DELETE');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const db = getDb();
  try {
    if (isSupabase()) {
      const { data } = await db.from('grocery_items').select('id').eq('checked', true);
      const count = data?.length || 0;
      await db.from('grocery_items').delete().eq('checked', true);
      return res.json({ success: true, deleted_count: count });
    }

    const info = db.prepare('DELETE FROM grocery_items WHERE checked = 1').run();
    return res.json({ success: true, deleted_count: info.changes });
  } catch (e: any) {
    return res.status(500).json({ error: e.message });
  }
}