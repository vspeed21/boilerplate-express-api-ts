import jwt from 'jsonwebtoken';
import environment from '../environment';

function generateJWT(user: any | number) {
  return jwt.sign({ user }, environment.JWT_SECRET);
}

export default generateJWT;
