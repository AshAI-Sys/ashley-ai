/**
 * Type declarations for bcryptjs
 * Since @types/bcryptjs is deprecated, we provide our own type definitions
 */
declare module 'bcryptjs' {
  /**
   * Hash a password using bcrypt
   * @param data The data to be encrypted
   * @param saltOrRounds A salt string or number of rounds
   */
  export function hash(
    data: string | Buffer,
    saltOrRounds: string | number
  ): Promise<string>;

  /**
   * Synchronously hash a password using bcrypt
   * @param data The data to be encrypted
   * @param saltOrRounds A salt string or number of rounds
   */
  export function hashSync(
    data: string | Buffer,
    saltOrRounds: string | number
  ): string;

  /**
   * Compare a password with a hash
   * @param data The data to be compared
   * @param encrypted The hash to compare against
   */
  export function compare(
    data: string | Buffer,
    encrypted: string
  ): Promise<boolean>;

  /**
   * Synchronously compare a password with a hash
   * @param data The data to be compared
   * @param encrypted The hash to compare against
   */
  export function compareSync(
    data: string | Buffer,
    encrypted: string
  ): boolean;

  /**
   * Generate a salt
   * @param rounds Number of rounds (default: 10)
   */
  export function genSalt(rounds?: number): Promise<string>;

  /**
   * Synchronously generate a salt
   * @param rounds Number of rounds (default: 10)
   */
  export function genSaltSync(rounds?: number): string;

  /**
   * Get the number of rounds used to encrypt a hash
   * @param encrypted The hash to get rounds from
   */
  export function getRounds(encrypted: string): number;
}
