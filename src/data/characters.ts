import type { SalemCharacter } from '@/types/game'

export const SALEM_CHARACTERS: readonly SalemCharacter[] = [
  {
    id: 'abigail-williams',
    name: 'Abigail Williams',
    roleHint: 'Acusadora',
    ability: 'Sus sospechas encienden los juicios del pueblo.',
    accentColor: '#8b2e2e'
  },
  {
    id: 'cotton-mather',
    name: 'Cotton Mather',
    roleHint: 'Predicador',
    ability: 'Su fervor guía la caza de brujas en Salem.',
    accentColor: '#3e5469'
  },
  {
    id: 'george-burroughs',
    name: 'George Burroughs',
    roleHint: 'Exministro',
    ability: 'Resiste las acusaciones con temple firme.',
    accentColor: '#4c6148'
  },
  {
    id: 'giles-corey',
    name: 'Giles Corey',
    roleHint: 'Granjero',
    ability: 'Guarda silencio incluso bajo la mayor presión.',
    accentColor: '#7a5a3a'
  },
  {
    id: 'john-proctor',
    name: 'John Proctor',
    roleHint: 'Posadero',
    ability: 'Desafía la histeria con su palabra directa.',
    accentColor: '#5c4938'
  },
  {
    id: 'martha-corey',
    name: 'Martha Corey',
    roleHint: 'Devota',
    ability: 'Cuestiona las pruebas sin temor al tribunal.',
    accentColor: '#6b4c6e'
  },
  {
    id: 'mary-warren',
    name: 'Mary Warren',
    roleHint: 'Sirvienta',
    ability: 'Duda entre la verdad y la presión del grupo.',
    accentColor: '#8c6d46'
  },
  {
    id: 'rebecca-nurse',
    name: 'Rebecca Nurse',
    roleHint: 'Matriarca',
    ability: 'Su reputación inspira respeto en toda la aldea.',
    accentColor: '#3f635c'
  },
  {
    id: 'samuel-parris',
    name: 'Samuel Parris',
    roleHint: 'Reverendo',
    ability: 'Vigila cada movimiento desde el púlpito.',
    accentColor: '#383d4f'
  },
  {
    id: 'sarah-good',
    name: 'Sarah Good',
    roleHint: 'Errante',
    ability: 'Sobrevive al margen de las habladurías.',
    accentColor: '#6d574b'
  },
  {
    id: 'tituba',
    name: 'Tituba',
    roleHint: 'Curandera',
    ability: 'Conoce los secretos que susurra la noche.',
    accentColor: '#593d5e'
  },
  {
    id: 'william-phips',
    name: 'William Phips',
    roleHint: 'Gobernador',
    ability: 'Su autoridad puede inclinar cualquier veredicto.',
    accentColor: '#785e2f'
  }
]
