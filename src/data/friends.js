/* Your friends on gathr: sample until the friends service exists. The Friends screen and Going as read this one list.
   id is stable; name is the first name the app shows */
const FRIENDS = [
  { id: 'zoya', name: 'Zoya', from: 'From your contacts', together: '5 nights together' },
  { id: 'aman', name: 'Aman', from: 'From your contacts', together: '4 nights together' },
  { id: 'kavya', name: 'Kavya', from: 'Joined from your plan link', together: '2 nights together' },
  { id: 'kabir', name: 'Kabir', from: 'Added by QR at Opus', together: '1 night together' }
];
const ISHAAN = { id: 'ishaan', name: 'Ishaan', from: 'Joined from your plan link', together: 'New' };

export function friendsOf(S) {
  return S.ishaan === 'yes' ? FRIENDS.concat(ISHAAN) : FRIENDS;
}
