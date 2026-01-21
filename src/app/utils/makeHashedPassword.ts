import bcrypt from 'bcrypt';
import { envVars } from '../../config/envVariable.config';



export const makeHashedPassword = async (password: string): Promise<string> => {
    return await bcrypt.hash(password, Number(envVars.BCRYPT_SALT_ROUNDS));

};