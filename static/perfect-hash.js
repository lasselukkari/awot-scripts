// Modified from https://github.com/mixu/perfect realeased under the BSD license.
// Originally ported from Steve Hanov's perfect minimal hash generator http://stevehanov.ca/blog/index.php?id=119

const hash = (string, seed = 0x811C9DC5) => {
  let value = seed;

  for (let i = 0; i < string.length; i += 1) {
    value += (value << 1) + (value << 4) + (value << 7) + (value << 8) + (value << 24);
    value ^= string.charCodeAt(i);
  }

  return value & 0x7FFFFFFF;
};

const create = dict => {
  const size = Object.keys(dict).length;
  const buckets = [];
  const table = new Array(size);
  const values = new Array(size);
  let bucket;
  let bucketIndex;

  for (const key of Object.keys(dict)) {
    const bkey = hash(key) % size;

    if (!buckets[bkey]) {
      buckets[bkey] = [];
    }

    buckets[bkey].push(key);
  }

  buckets.sort((a, b) => b.length - a.length);

  for (bucketIndex = 0; bucketIndex < size; bucketIndex += 1) {
    if (buckets[bucketIndex].length <= 1) {
      break;
    }

    bucket = buckets[bucketIndex];

    let d = 1;
    let item = 0;
    let slots = [];
    let slot;
    let used = {};

    while (item < bucket.length) {
      slot = hash(bucket[item], d) % size;

      if (values[slot] || used[slot]) {
        d += 1;
        item = 0;
        slots = [];
        used = {};
      } else {
        used[slot] = true;
        slots.push(slot);
        item += 1;
      }
    }

    table[hash(bucket[0]) % size] = d;

    for (const [i, element] of bucket.entries()) {
      values[slots[i]] = dict[element];
    }
  }

  const freelist = [];
  for (let i = 0; i < size; i += 1) {
    if (typeof values[i] === 'undefined') {
      freelist.push(i);
    }
  }

  for (let i = bucketIndex; i < size; i += 1) {
    if (!buckets[i] || buckets[i].length === 0) {
      break;
    }

    bucket = buckets[i];
    const valueSlot = freelist.pop();

    table[hash(bucket[0]) % size] = 0 - valueSlot - 1;
    values[valueSlot] = dict[bucket[0]];
  }

  return [Array.from(table, item => item || 0), values];
};

module.exports = {create, hash};
