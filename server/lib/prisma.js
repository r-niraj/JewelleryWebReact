const db = require('./db');

const TABLE = {
  customer: 'customers',
  product: 'products',
  productImage: 'product_images',
  productVideo: 'product_videos',
  order: 'orders',
  orderStatusHistory: 'order_status_history',
  orderItem: 'order_items',
  admin: 'admins',
  setting: 'settings',
  heroContent: 'hero_content',
  productFeature: 'product_features',
  galleryImage: 'gallery_images',
  luxuryBenefit: 'luxury_benefits',
  cTASection: 'cta_sections',
  mediaLibrary: 'media_library',
  heroMedia: 'hero_media',
  sectionImage: 'section_images',
};

const PK = {
  customers: 'customer_id',
  products: 'id',
  product_images: 'id',
  product_videos: 'id',
  orders: 'order_id',
  order_status_history: 'history_id',
  order_items: 'id',
  admins: 'admin_id',
  settings: 'setting_id',
  hero_content: 'id',
  product_features: 'id',
  gallery_images: 'id',
  luxury_benefits: 'id',
  cta_sections: 'id',
  media_library: 'id',
  hero_media: 'id',
  section_images: 'id',
};

const INCLUDE_JOIN = {
  product_images: { parentKey: 'product_id', childKey: 'productId' },
  product_videos: { parentKey: 'product_id', childKey: 'productId' },
  orders: { parentKey: 'customer_id', childKey: 'customerId' },
};

function col(key) {
  return key.replace(/[A-Z]/g, c => '_' + c.toLowerCase());
}

function cols(obj) {
  const out = {};
  for (const k of Object.keys(obj)) out[col(k)] = obj[k];
  return out;
}

function expandWhere(where) {
  if (!where) return { sql: '', params: [] };
  const clauses = [];
  const params = [];
  for (const [key, val] of Object.entries(where)) {
    if (val && typeof val === 'object' && !Array.isArray(val) && !(val instanceof Date)) {
      const op = Object.keys(val)[0];
      const v = val[op];
      switch (op) {
        case 'gte': clauses.push(`${col(key)} >= ?`); params.push(v); break;
        case 'lte': clauses.push(`${col(key)} <= ?`); params.push(v); break;
        case 'gt': clauses.push(`${col(key)} > ?`); params.push(v); break;
        case 'lt': clauses.push(`${col(key)} < ?`); params.push(v); break;
        case 'not':
          if (v === null) clauses.push(`${col(key)} IS NOT NULL`);
          else { clauses.push(`${col(key)} != ?`); params.push(v); }
          break;
        case 'contains': clauses.push(`${col(key)} LIKE ?`); params.push(`%${v}%`); break;
        case 'in': clauses.push(`${col(key)} IN (${v.map(() => '?').join(',')})`); params.push(...v); break;
      }
    } else if (val === null) {
      clauses.push(`${col(key)} IS NULL`);
    } else {
      clauses.push(`${col(key)} = ?`);
      params.push(val);
    }
  }
  return { sql: clauses.join(' AND '), params };
}

function expandOrderBy(orderBy) {
  if (!orderBy) return '';
  if (typeof orderBy === 'string') return `ORDER BY ${col(orderBy)} ASC`;
  const entries = Object.entries(orderBy);
  return 'ORDER BY ' + entries.map(([k, v]) => `${col(k)} ${String(v).toUpperCase()}`).join(', ');
}

async function findUnique(model, args) {
  const table = TABLE[model];
  if (!table) throw new Error(`Unknown model: ${model}`);
  const w = expandWhere(args.where);
  const sql = `SELECT * FROM \`${table}\` WHERE ${w.sql} LIMIT 1`;
  const rows = await db.query(sql, w.params);
  const row = rows[0] || null;
  if (row && args.include) return attachIncludes(model, row, args.include);
  return row;
}

async function findFirst(model, args) {
  const table = TABLE[model];
  if (!table) throw new Error(`Unknown model: ${model}`);
  const w = expandWhere(args?.where);
  const ob = args?.orderBy ? expandOrderBy(args.orderBy) : '';
  const sql = `SELECT * FROM \`${table}\` ${w.sql ? 'WHERE ' + w.sql : ''} ${ob} LIMIT 1`;
  const rows = await db.query(sql, w.params);
  const row = rows[0] || null;
  if (row && args?.include) return attachIncludes(model, row, args.include);
  return row;
}

async function findMany(model, args) {
  const table = TABLE[model];
  if (!table) throw new Error(`Unknown model: ${model}`);
  const w = expandWhere(args?.where);
  const ob = args?.orderBy ? expandOrderBy(args.orderBy) : '';
  let limit = '';
  let offset = '';
  if (args?.take) limit = `LIMIT ${Number(args.take)}`;
  if (args?.skip) offset = `OFFSET ${Number(args.skip)}`;
  let sql = `SELECT * FROM \`${table}\` ${w.sql ? 'WHERE ' + w.sql : ''} ${ob} ${limit} ${offset}`;
  let rows = await db.query(sql, w.params);
  if (rows && args?.include) {
    rows = await Promise.all(rows.map(r => attachIncludes(model, r, args.include)));
  }
  return rows;
}

async function attachIncludes(model, row, include) {
  row = { ...row };
  for (const [rel, val] of Object.entries(include)) {
    if (!val) continue;
    let joinTable, parentKey, childKey;
    if (rel === 'images' && model === 'product') {
      joinTable = 'product_images'; parentKey = 'id'; childKey = 'product_id';
    } else if (rel === 'videos' && model === 'product') {
      joinTable = 'product_videos'; parentKey = 'id'; childKey = 'product_id';
    } else if (rel === 'product' && (model === 'orderItem' || model === 'order')) {
      joinTable = 'products'; parentKey = 'product_id'; childKey = 'id';
    } else if (rel === 'customer' && model === 'order') {
      joinTable = 'customers'; parentKey = 'customer_id'; childKey = 'customer_id';
    } else if (rel === 'media' && (model === 'heroMedia' || model === 'sectionImage')) {
      joinTable = 'media_library'; parentKey = 'media_id'; childKey = 'id';
    } else if (rel === 'order' && model === 'orderStatusHistory') {
      joinTable = 'orders'; parentKey = 'order_id'; childKey = 'order_id';
    } else {
      continue;
    }
    const pk = PK[joinTable] || 'id';
    const fk = typeof parentKey === 'number' ? parentKey : parentKey;
    const id = row[childKey] || row[parentKey === 'id' ? 'id' : childKey];
    if (!id) { row[rel] = null; continue; }

    if (rel === 'images' || rel === 'videos') {
      const childRows = await db.query(`SELECT * FROM \`${joinTable}\` WHERE ${fk} = ? ORDER BY display_order ASC`, [id]);
      row[rel] = childRows;
    } else {
      const childRows = await db.query(`SELECT * FROM \`${joinTable}\` WHERE ${pk} = ? LIMIT 1`, [id]);
      row[rel] = childRows[0] || null;
    }
  }
  return row;
}

async function create(model, args) {
  const table = TABLE[model];
  if (!table) throw new Error(`Unknown model: ${model}`);
  const data = cols(args.data);
  const keys = Object.keys(data);
  const vals = Object.values(data);
  const placeholders = keys.map(() => '?').join(',');
  const sql = `INSERT INTO \`${table}\` (${keys.map(k => '`' + k + '`').join(',')}) VALUES (${placeholders})`;
  const result = await db.query(sql, vals);
  const pk = PK[table] || 'id';
  const inserted = await db.query(`SELECT * FROM \`${table}\` WHERE \`${pk}\` = ? LIMIT 1`, [result.insertId]);
  let row = inserted[0] || { ...data, [pk]: result.insertId };
  if (row && args.include) row = await attachIncludes(model, row, args.include);
  return row;
}

async function update(model, args) {
  const table = TABLE[model];
  if (!table) throw new Error(`Unknown model: ${model}`);
  const data = cols(args.data);
  const w = expandWhere(args.where);
  const setClause = Object.keys(data).map(k => `\`${k}\` = ?`).join(',');
  const sql = `UPDATE \`${table}\` SET ${setClause} WHERE ${w.sql}`;
  const params = [...Object.values(data), ...w.params];
  await db.query(sql, params);
  const selectSql = `SELECT * FROM \`${table}\` WHERE ${w.sql} LIMIT 1`;
  const rows = await db.query(selectSql, w.params);
  let row = rows[0] || null;
  if (row && args.include) row = await attachIncludes(model, row, args.include);
  return row;
}

async function updateMany(model, args) {
  const table = TABLE[model];
  if (!table) throw new Error(`Unknown model: ${model}`);
  const data = cols(args.data);
  const w = expandWhere(args.where);
  const setClause = Object.keys(data).map(k => `\`${k}\` = ?`).join(',');
  const sql = `UPDATE \`${table}\` SET ${setClause} WHERE ${w.sql}`;
  const params = [...Object.values(data), ...w.params];
  const result = await db.query(sql, params);
  return { count: result.affectedRows };
}

async function del(model, args) {
  const table = TABLE[model];
  if (!table) throw new Error(`Unknown model: ${model}`);
  const w = expandWhere(args.where);
  const sql = `DELETE FROM \`${table}\` WHERE ${w.sql}`;
  const result = await db.query(sql, w.params);
  return { count: result.affectedRows };
}

async function deleteMany(model, args) {
  return del(model, args);
}

async function upsert(model, args) {
  const table = TABLE[model];
  if (!table) throw new Error(`Unknown model: ${model}`);
  const existing = await findFirst(model, { where: args.where });
  if (existing) {
    return update(model, { where: args.where, data: { ...args.update, ...args.create } });
  }
  return create(model, { data: { ...args.create, ...args.update } });
}

async function count(model, args) {
  const table = TABLE[model];
  if (!table) throw new Error(`Unknown model: ${model}`);
  const w = expandWhere(args?.where);
  const sql = `SELECT COUNT(*) AS \`count\` FROM \`${table}\` ${w.sql ? 'WHERE ' + w.sql : ''}`;
  const rows = await db.query(sql, w.params);
  return Number(rows[0].count);
}

async function aggregate(model, args) {
  const table = TABLE[model];
  if (!table) throw new Error(`Unknown model: ${model}`);
  const w = expandWhere(args.where);
  const agg = args._max || args._sum || {};
  const op = args._max ? 'MAX' : 'SUM';
  const target = args._max || args._sum;
  const field = Object.keys(target)[0];
  const sql = `SELECT ${op}(\`${col(field)}\`) AS \`value\` FROM \`${table}\` ${w.sql ? 'WHERE ' + w.sql : ''}`;
  const rows = await db.query(sql, w.params);
  const result = { _max: {}, _sum: {} };
  if (args._max) result._max[field] = rows[0]?.value ?? null;
  if (args._sum) result._sum[field] = rows[0]?.value ?? null;
  return result;
}

async function groupBy(model, args) {
  const table = TABLE[model];
  if (!table) throw new Error(`Unknown model: ${model}`);
  const byFields = args.by || [];
  const selectCols = byFields.map(f => `\`${col(f)}\``).join(', ');
  const sql = `SELECT ${selectCols}, COUNT(*) AS \`_count\` FROM \`${table}\` GROUP BY ${selectCols}`;
  const rows = await db.query(sql);
  return rows.map(r => ({ ...r, _count: Number(r._count) }));
}

const prisma = {};
for (const model of Object.keys(TABLE)) {
  prisma[model] = {
    findUnique: (args) => findUnique(model, args),
    findFirst: (args) => findFirst(model, args),
    findMany: (args) => findMany(model, args),
    create: (args) => create(model, args),
    update: (args) => update(model, args),
    updateMany: (args) => updateMany(model, args),
    delete: (args) => del(model, args),
    deleteMany: (args) => deleteMany(model, args),
    upsert: (args) => upsert(model, args),
    count: (args) => count(model, args),
    aggregate: (args) => aggregate(model, args),
    groupBy: (args) => groupBy(model, args),
  };
}

module.exports = prisma;