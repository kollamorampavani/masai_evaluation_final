import jwt from 'jsonwebtoken';
import { supabase } from '../config/supabaseClient.js';

export const protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      token = req.headers.authorization.split(' ')[1];

      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret');

      const { data, error } = await supabase
        .from('users')
        .select('id, name, email')
        .eq('id', decoded.id)
        .single();

      if (error || !data) {
        return res.status(401).json({ message: 'Not authorized, user not found' });
      }

      req.user = data;
      next();
    } catch (error) {
      console.error(error);
      res.status(401).json({ message: 'Not authorized, token failed' });
    }
  }

  if (!token) {
    res.status(401).json({ message: 'Not authorized, no token' });
  }
};
