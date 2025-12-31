import bcrypt from 'bcrypt';
import { envVars } from '../../config/envVariable.config';



export const makeHashedPassword = async (password: string): Promise<string> => {
    const hashed = await bcrypt.hash(password, Number(envVars.BCRYPT_SALT_ROUNDS));
    return hashed;
};