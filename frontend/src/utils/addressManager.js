export const DEFAULT_CUSTOMER_ADDRESSES = [
  {
    id: 1,
    title: 'Home',
    tag: 'Home',
    isDefault: true,
    address: 'Flat 301, Sunshine Heights, 80 Feet Rd, Koramangala',
    area: 'Koramangala',
    city: 'Bengaluru 560034',
    state: 'Karnataka',
    pincode: '560034',
    time: '15-25 min delivery',
    radius: '5 km'
  },
  {
    id: 2,
    title: 'Work',
    tag: 'Work',
    isDefault: false,
    address: 'Building 4, Tech Park, Outer Ring Rd, Marathahalli',
    area: 'Marathahalli',
    city: 'Bengaluru 560103',
    state: 'Karnataka',
    pincode: '560103',
    time: '15-25 min delivery',
    radius: '5 km'
  }
];

export const getCustomerAddressKey = (userOrPhone) => {
  try {
    let phone = '';
    if (typeof userOrPhone === 'string') {
      phone = userOrPhone;
    } else if (userOrPhone && typeof userOrPhone === 'object') {
      phone = userOrPhone.phone || '';
    } else {
      const u = JSON.parse(localStorage.getItem('grabit_user') || '{}');
      phone = u.phone || '';
    }
    const digits = (phone || '').replace(/\D/g, '');
    const canonical = digits.length >= 10 ? digits.slice(-10) : digits;
    return canonical ? `grabit_addresses_${canonical}` : 'grabit_addresses_default';
  } catch {
    return 'grabit_addresses_default';
  }
};

export const loadCustomerAddresses = (userOrPhone) => {
  try {
    let activePhone = '';
    if (typeof userOrPhone === 'string') {
      activePhone = userOrPhone;
    } else if (userOrPhone && typeof userOrPhone === 'object') {
      activePhone = userOrPhone.phone || '';
    } else {
      const session = localStorage.getItem('grabit_session');
      const uStr = localStorage.getItem('grabit_user');
      if (!session || !uStr) {
        return [];
      }
      const u = JSON.parse(uStr || '{}');
      activePhone = u.phone || '';
    }

    if (!activePhone) {
      return [];
    }

    const key = getCustomerAddressKey(activePhone);
    const raw = localStorage.getItem(key);

    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed.map((item, idx) => ({
          id: item.id || idx + 1,
          title: item.title || item.tag || 'Home',
          tag: item.tag || item.title || 'Home',
          isDefault: Boolean(item.isDefault),
          address: item.address || '',
          area: item.area || (item.city ? item.city.split(',')[0].trim() : 'Koramangala'),
          city: item.city || 'Bengaluru 560034',
          state: item.state || 'Karnataka',
          pincode: item.pincode || (item.city && item.city.match(/\d{6}/) ? item.city.match(/\d{6}/)[0] : '560034'),
          time: item.time || '15-25 min delivery',
          radius: item.radius || '5 km'
        }));
      }
    }

    // Auto-seed default addresses for a logged-in user if none exist yet
    localStorage.setItem(key, JSON.stringify(DEFAULT_CUSTOMER_ADDRESSES));
    return DEFAULT_CUSTOMER_ADDRESSES;
  } catch {
    return [];
  }
};

export const saveCustomerAddresses = (addresses, userOrPhone) => {
  try {
    const key = getCustomerAddressKey(userOrPhone);
    localStorage.setItem(key, JSON.stringify(addresses));
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new Event('grabit_addresses_updated'));
      window.dispatchEvent(new Event('grabit_auth_updated'));
      window.dispatchEvent(new Event('storage'));
    }
  } catch (err) {
    console.warn('Failed to save addresses to storage:', err);
  }
};
