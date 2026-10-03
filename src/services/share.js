import { APP_URL, CFG } from '../config';

/* Free device services: share, WhatsApp, maps, calendar, contacts, clipboard */
export const Share = {
  copy: (text) => {
    if (navigator.clipboard && window.isSecureContext)
      return navigator.clipboard.writeText(text).then(() => 'copied');
    return new Promise((ok, no) => {
      try {
        var t = document.createElement('textarea');
        t.value = text;
        t.setAttribute('readonly', '');
        t.style.position = 'fixed';
        t.style.opacity = '0';
        document.body.appendChild(t);
        t.select();
        var r = document.execCommand('copy');
        document.body.removeChild(t);
        r ? ok('copied') : no(new Error('copy'));
      } catch (e) {
        no(e);
      }
    });
  } /* resolves 'shared' | 'copied' | 'cancelled' */,
  link: (title, text, url) => {
    if (navigator.share)
      return navigator.share({ title: title, text: text, url: url }).then(
        () => 'shared',
        (e) => {
          if (e && e.name === 'AbortError') return 'cancelled';
          return Share.copy(text + ' ' + url);
        }
      );
    return Share.copy(text + ' ' + url);
  },
  open: (u) => {
    var w = window.open(u, '_blank');
    if (w) {
      try {
        w.opener = null;
      } catch (e) {}
    } else location.href = u;
  },
  whatsapp: (text) => {
    Share.open('https://wa.me/?text=' + encodeURIComponent(text));
  },
  directions: (v) => {
    Share.open('https://www.google.com/maps/dir/?api=1&destination=' + v.lat + ',' + v.lng);
  },
  mail: (subject, body) => {
    location.href =
      'mailto:' +
      CFG.contactEmail +
      '?subject=' +
      encodeURIComponent(subject) +
      '&body=' +
      encodeURIComponent(body || '');
  },
  ics: (e, v) => {
    var st = new Date(e.iso),
      en = new Date(e.iso);
    en.setHours(en.getHours() + 5);
    function f(d) {
      return d
        .toISOString()
        .replace(/[-:]/g, '')
        .replace(/\.\d{3}/, '');
    }
    var body = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//gathr//EN',
      'BEGIN:VEVENT',
      'UID:' + e.id + '@gathr',
      'DTSTAMP:' + f(new Date()),
      'DTSTART:' + f(st),
      'DTEND:' + f(en),
      'SUMMARY:' + e.title,
      'LOCATION:' + v.name + ', ' + v.area + ', Pune',
      'DESCRIPTION:Show your gathr pass and ID at the door. ' + APP_URL + '#e=' + e.id,
      'END:VEVENT',
      'END:VCALENDAR'
    ].join('\r\n');
    var a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([body], { type: 'text/calendar' }));
    a.download = e.id + '.ics';
    document.body.appendChild(a);
    a.click();
    setTimeout(() => {
      URL.revokeObjectURL(a.href);
      a.remove();
    }, 500);
  },
  contactsSupported: !!(navigator.contacts && navigator.contacts.select),
  pickContacts: () => navigator.contacts.select(['name', 'tel'], { multiple: true }),
  file: (blob, name, title) => {
    var file = new File([blob], name, { type: blob.type });
    if (navigator.canShare && navigator.canShare({ files: [file] }))
      return navigator.share({ files: [file], title: title }).then(
        () => 'shared',
        (e) => (e && e.name === 'AbortError' ? 'cancelled' : Share.download(blob, name))
      );
    return Promise.resolve(Share.download(blob, name));
  },
  download: (blob, name) => {
    var a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = name;
    document.body.appendChild(a);
    a.click();
    setTimeout(() => {
      URL.revokeObjectURL(a.href);
      a.remove();
    }, 500);
    return 'saved';
  }
};
