export enum UserRole {
  ESTUDIANTE = 1,
  TUTOR = 2,
  COORDINADOR = 3
}

export const ROLE_LABELS: Record<UserRole, string> = {
  [UserRole.ESTUDIANTE]: 'Estudiante',
  [UserRole.TUTOR]: 'Tutor',
  [UserRole.COORDINADOR]: 'Coordinador'
};
