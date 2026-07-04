export const getInverseLabel = (
  forwardLabel: string, 
  fromGender?: string, 
  toGender?: string
): string => {
  const label = forwardLabel.toLowerCase();
  const fromG = (fromGender || '').toLowerCase();
  
  // Semantics: 
  // Row A -> B with label L means: "B is L of A"
  // So inverse Row B -> A must have label describing A from B's view
  
  // Examples:
  // Row: from=Rajesh, to=Amit, label='son'  (Amit is Rajesh's son)
  // Inverse: from=Amit, to=Rajesh, label='father' (Rajesh is Amit's father)
  
  // Note: The inverse depends on from_member (original) gender
  
  switch (label) {
    // If B is son of A, then A is father/mother of B (based on A's gender)
    case 'son':
    case 'daughter':
      return fromG === 'female' ? 'mother' : 'father';
    
    // If B is father of A, then A is son/daughter of B (based on A's gender)
    case 'father':
    case 'mother':
      return fromG === 'female' ? 'daughter' : 'son';
    
    // Spouses
    case 'husband':
      return 'wife';  // if B is husband, then in reverse A is wife
    case 'wife':
      return 'husband';
    
    // Siblings
    case 'brother':
    case 'sister':
      return fromG === 'female' ? 'sister' : 'brother';
    
    // Grandparents/grandchildren
    case 'grandfather':
    case 'grandmother':
      return fromG === 'female' ? 'granddaughter' : 'grandson';
    case 'grandson':
    case 'granddaughter':
      return fromG === 'female' ? 'grandmother' : 'grandfather';
    
    // Uncle/aunt
    case 'uncle':
    case 'aunt':
      return fromG === 'female' ? 'niece' : 'nephew';
    case 'nephew':
    case 'niece':
      return fromG === 'female' ? 'aunt' : 'uncle';
    
    // Cousins
    case 'cousin':
    case 'cousin_paternal':
    case 'cousin_maternal':
      return label;  // Cousin stays as cousin
    
    default:
      return 'related';
  }
};
