const PERMISSION = {
  READ: 1,
  CREATE: 2,
  UPDATE: 4,
  DELETE: 8,
  kICk: 16,
  TRANSFERROlE: 32,
};

function hasPermission(userPermission) {
  const grantedPermission = [];
  for (const [name, mask] of Object.entries(PERMISSION)) {
    console.log('------------');
    console.log('Permission   :', name);
    console.log('Mask (bin)   :', mask.toString(2).padStart(4, '0'));
    console.log('User (bin)   :', userPermission.toString(2).padStart(4, '0'));
    console.log(
      'AND Result   :',
      (userPermission & mask).toString(2).padStart(4, '0')
    );
    console.log('Check        :', (userPermission & mask) === mask);
    if ((userPermission & mask) === mask) {
      grantedPermission.push(name);
    }
  }

  return grantedPermission;
}
let projectowner = 4;

console.log('haspermission:', hasPermission(projectowner));
console.log(
  'user have ability to UPDATE :',
  hasPermission(projectowner).includes('UPDATE')
);
