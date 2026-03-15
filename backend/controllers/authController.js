import bcrypt from 'bcryptjs';
import { supabase } from '../config/supabaseClient.js';
import generateToken from '../utils/generateToken.js';

export const signup = async (req, res) => {
  const { name, email, password } = req.body;

  try {
    const { data: userExists } = await supabase
      .from('Users')
      .select('email')
      .eq('email', email)
      .single();

    if (userExists) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const { data, error } = await supabase
      .from('Users')
      .insert([
        {
          name,
          email,
          password: hashedPassword,
          balance: 10000 // Initial bonus balance
        }
      ])
      .select()
      .single();

    if (error) throw error;

    res.status(201).json({
      id: data.id,
      name: data.name,
      email: data.email,
      balance: data.balance,
      token: generateToken(data.id)
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
};

export const login = async (req, res) => {
  const { email, password } = req.body;

  try {
    const { data: user, error } = await supabase
      .from('Users')
      .select('*')
      .eq('email', email)
      .single();

    if (error || !user) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (isMatch) {
      res.json({
        id: user.id,
        name: user.name,
        email: user.email,
        balance: user.balance,
        token: generateToken(user.id)
      });
    } else {
      res.status(401).json({ message: 'Invalid email or password' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
};
