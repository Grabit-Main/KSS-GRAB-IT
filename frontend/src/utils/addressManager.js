// Empty by default - every new account starts completely fresh with 0 addresses
export const DEFAULT_CUSTOMER_ADDRESSES = [];

// Helper to identify legacy dummy addresses (Sunshine Heights, Marathahalli)
export const isDummyAddress = (item) => {
  if (!item) return false;
  const str = `${item.address || ''} ${item.title || ''} ${item.city || ''} ${item.area || ''}`.toLowerCase();
  return str.includes('sunshine heights') || str.includes('marathahalli') || str.includes('tech park, outer ring');
};

export const getCustomerAddressKey = (userOrPhone) => {
  try {
    let phone = '';
    if (typeof userOrPhone === 'string') {
      phone = userOrPhone;
    } else if (userOrPhone && typeof userOrPhone === 'object') {
      phone = userOrPhone.phone || userOrPhone.id || '';
    } else {
      const u = JSON.parse(localStorage.getItem('grabit_user') || '{}');
      phone = u.phone || u.id || '';
    }
    const digits = (String(phone) || '').replace(/\D/g, '');
    const canonical = digits.length >= 10 ? digits.slice(-10) : digits;
    return canonical ? `grabit_addresses_${canonical}` : 'grabit_addresses_guest';
  } catch {
    return 'grabit_addresses_guest';
  }
};

export const loadCustomerAddresses = (userOrPhone) => {
  try {
    const key = getCustomerAddressKey(userOrPhone);
    const raw = localStorage.getItem(key);

    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        // Filter out any legacy dummy addresses
        const clean = parsed.filter(item => !isDummyAddress(item));
        
        // If clean list is smaller, save back cleaned list
        if (clean.length !== parsed.length) {
          localStorage.setItem(key, JSON.stringify(clean));
        }

        if (clean.length > 0) {
          return clean.map((item, idx) => ({
            id: item.id || idx + 1,
            title: item.title || item.tag || 'Home',
            tag: item.tag || item.title || 'Home',
            isDefault: Boolean(item.isDefault),
            address: item.address || '',
            area: item.area || (item.city ? item.city.split(',')[0].trim() : ''),
            city: item.city || '',
            state: item.state || '',
            pincode: item.pincode || (item.city && item.city.match(/\d{6}/) ? item.city.match(/\d{6}/)[0] : ''),
            time: item.time || '15-25 min delivery',
            radius: item.radius || '5 km'
          }));
        }
      }
    }
  } catch (err) {
    console.warn('Error loading customer addresses:', err);
  }

  // Fresh accounts start with 0 addresses - no auto-seeding!
  return [];
};

export const saveCustomerAddresses = (addresses, userOrPhone) => {
  try {
    const key = getCustomerAddressKey(userOrPhone);
    const listToSave = Array.isArray(addresses) ? addresses.filter(item => !isDummyAddress(item)) : [];
    localStorage.setItem(key, JSON.stringify(listToSave));
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new Event('grabit_addresses_updated'));
      window.dispatchEvent(new Event('grabit_auth_updated'));
      window.dispatchEvent(new Event('storage'));
    }
  } catch (err) {
    console.warn('Failed to save addresses to storage:', err);
  }
};
