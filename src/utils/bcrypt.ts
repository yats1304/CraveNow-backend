import bcrypt from "bcryptjs";

const SALT_ROUND = 10;

export const hashPassword = async (password: string): Promise<string> => {
  return await bcrypt.hash(password, SALT_ROUND);
};

export const comparePassword = async (
  password: string,
  hashedPassword: string,
): Promise<boolean> => {
  const comparedPassword = await bcrypt.compare(password, hashedPassword);

  return comparedPassword;
};
