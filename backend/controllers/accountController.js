import { supabase } from '../config/supabaseClient.js';

export const getBalance = async (req, res) => {
  try {
    const { data: user, error } = await supabase
      .from('Users')
      .select('balance')
      .eq('id', req.user.id)
      .single();

    if (error) throw error;
    res.json({ balance: user.balance });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
};

export const getStatement = async (req, res) => {
  try {
    const { data: transactions, error } = await supabase
      .from('Transactions')
      .select(`
        id,
        amount,
        transaction_type,
        created_at,
        sender:sender_id(id, name),
        receiver:receiver_id(id, name)
      `)
      .or(`sender_id.eq.${req.user.id},receiver_id.eq.${req.user.id}`)
      .order('created_at', { ascending: false });

    if (error) throw error;
    
    // The requirements say "Transaction Type: Credit/Debit"
    // And "Each transfer should create two entries: Debit (Deducted from sender), Credit (Added to receiver)"
    // Filtering down to just the entry that applies to the current user
    const statement = transactions.filter(t => {
      if (t.transaction_type === 'Debit' && t.sender && t.sender.id === req.user.id) return true;
      if (t.transaction_type === 'Credit' && t.receiver && t.receiver.id === req.user.id) return true;
      return false;
    }).map((t) => {
      return {
        id: t.id,
        date: t.created_at,
        type: t.transaction_type,
        amount: t.amount,
        sender: t.sender ? t.sender.name : 'Unknown',
        receiver: t.receiver ? t.receiver.name : 'Unknown'
      };
    });

    res.json(statement);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
};

export const transfer = async (req, res) => {
  const { receiver_id, amount } = req.body;
  const numAmount = Number(amount);

  if (!receiver_id || !numAmount || numAmount <= 0) {
    return res.status(400).json({ message: 'Invalid receiver or amount' });
  }

  if (receiver_id === req.user.id) {
    return res.status(400).json({ message: 'Cannot transfer to yourself' });
  }

  try {
    const { data: sender, error: senderError } = await supabase
      .from('Users')
      .select('balance')
      .eq('id', req.user.id)
      .single();
    
    if (senderError || !sender) return res.status(404).json({ message: 'Sender not found' });
    
    if (sender.balance < numAmount) {
      return res.status(400).json({ message: 'Insufficient balance' });
    }

    const { data: receiver, error: receiverError } = await supabase
      .from('Users')
      .select('balance')
      .eq('id', receiver_id)
      .single();

    if (receiverError || !receiver) {
      return res.status(404).json({ message: 'Receiver not found' });
    }

    await supabase.from('Users').update({ balance: sender.balance - numAmount }).eq('id', req.user.id);
    await supabase.from('Users').update({ balance: receiver.balance + numAmount }).eq('id', receiver_id);

    // Create 2 entries
    const { error: t1Err } = await supabase.from('Transactions').insert([{
      sender_id: req.user.id,
      receiver_id: receiver_id,
      amount: numAmount,
      transaction_type: 'Debit'
    }]);

    const { error: t2Err } = await supabase.from('Transactions').insert([{
      sender_id: req.user.id,
      receiver_id: receiver_id,
      amount: numAmount,
      transaction_type: 'Credit'
    }]);

    if(t1Err || t2Err) throw new Error("Transaction logging failed");

    res.json({ message: 'Transfer successful' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
};

export const getUsers = async (req, res) => {
  try {
    const { data: users, error } = await supabase
      .from('Users')
      .select('id, name, email')
      .neq('id', req.user.id);

    if (error) throw error;
    res.json(users);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
};
