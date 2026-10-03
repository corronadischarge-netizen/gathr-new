export const WD = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

export const MO = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

const WD_HUE = ['blue', 'pink', 'pink', 'pink', 'yellow', 'violet', 'green'];

function midnight(d) {
  var x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
}

export function todayTxt() {
  var d = new Date();
  return WD[d.getDay()] + ' · ' + d.getDate() + ' ' + MO[d.getMonth()];
}

/* [key, long label, tag, short date, hue] for the day an event falls on */
export function dayOf(e) {
  var d = new Date(e.iso),
    diff = Math.round((midnight(d) - midnight(new Date())) / 86400000);
  if (diff >= 7) return ['later', 'Later', 'Later', 'coming up', 'red'];
  var tag = diff <= 0 ? 'Tonight' : diff === 1 ? 'Tmrw' : WD[d.getDay()].slice(0, 3);
  return [
    midnight(d).toISOString(),
    WD[d.getDay()],
    tag,
    d.getDate() + ' ' + MO[d.getMonth()],
    WD_HUE[d.getDay()]
  ];
}
