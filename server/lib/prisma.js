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

// Relations: currentModel.relName → { joinTable, currentCol (FK in current table), joinCol (PK in joined table), isMany }
const INCLUDE_MAP = {
  'product.images': { table: 'product_images', currentCol: 'id', joinCol: 'product_id', isMany: true },
  'product.videos': { table: 'product_videos', currentCol: 'id', joinCol: 'product_id', isMany: true },
  'order.customer': { table: 'customers', currentCol: 'customer_id', joinCol: 'customer_id' },
  'order.items': { table: 'order_items', currentCol: 'order_id', joinCol: 'order_id', isMany: true },
  'order.statusHistory': { table: 'order_status_history', currentCol: 'order_id', joinCol: 'order_id', isMany: true },
  'heroMedia.media': { table: 'media_library', currentCol: 'media_id', joinCol: 'id' },
  'sectionImage.media': { table: 'media_library', currentCol: 'media_id', joinCol: 'id' },
};

function camel(str) {
  return str.replace(/_([a-z])/g, (_, c) => c.toUpperCase());
}

function camelKeys(row) {
  if (!row || typeof row !== 'object') return row;
  if (Array.isArray(row)) return row.map(camelKeys);
  const out = {};
  for (const k of Object.keys(row)) out[camel(k)] = row[k];
  return out;
}

function col(key) {
  return key.replace(/[A-Z]/g, c => '_' + c.toLowerCase());
}

function cols(obj) {
  const out = {};
  for (const k of Object.keys(obj)) out[col(k)] = obj[k];
  return out;
}

async function exec(sql, params, conn) {
  if (conn) {
    const [result] = await conn.execute(sql, params);
    return result;
  }
  return db.query(sql, params);
}

async function query(sql, params, conn) {
  return camelKeys(await exec(sql, params, conn));
}

function expandWhere(where) {
  if (!where) return { sql: '', params: [] };
  const clauses = [];
  const params = [];
  for (const [key, val] of Object.entries(where)) {
    if (key === 'OR' && Array.isArray(val)) {
      const orParts = val.map(cond => expandWhere(cond)).filter(p => p.sql);
      if (orParts.length > 0) {
        clauses.push('(' + orParts.map(p => p.sql).join(' OR ') + ')');
        orParts.forEach(p => params.push(...p.params));
      }
    } else if (key === 'AND' && Array.isArray(val)) {
      const andParts = val.map(cond => expandWhere(cond));
      andParts.forEach(p => {
        if (p.sql) {
          clauses.push('(' + p.sql + ')');
          params.push(...p.params);
        }
      });
    } else if (val && typeof val === 'object' && !Array.isArray(val) && !(val instanceof Date)) {
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
        case 'startsWith': clauses.push(`${col(key)} LIKE ?`); params.push(`${v}%`); break;
        case 'endsWith': clauses.push(`${col(key)} LIKE ?`); params.push(`%${v}`); break;
        case 'in':
          if (v && v.length) { clauses.push(`${col(key)} IN (${v.map(() => '?').join(',')})`); params.push(...v); }
          break;
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
  if (typeof orderBy === 'string') return 'ORDER BY ' + col(orderBy) + ' ASC';
  if (Array.isArray(orderBy)) {
    const parts = orderBy.map(item => {
      const entry = Object.entries(item)[0];
      if (!entry) return '';
      return `${col(entry[0])} ${String(entry[1]).toUpperCase()}`;
    }).filter(Boolean);
    return 'ORDER BY ' + parts.join(', ');
  }
  const entries = Object.entries(orderBy);
  return 'ORDER BY ' + entries.map(([k, v]) => `${col(k)} ${String(v).toUpperCase()}`).join(', ');
}

async function attachIncludes(model, row, include, conn) {
  if (!include) return row;
  for (const [rel, val] of Object.entries(include)) {
    if (!val) continue;
    const key = `${model}.${rel}`;
    const cfg = INCLUDE_MAP[key];
    if (!cfg) continue;
    const fkValue = row[camel(cfg.currentCol)] ?? row[cfg.currentCol];
    if (fkValue == null) { row[rel] = cfg.isMany ? [] : null; continue; }
    let orderClause = '';
    if (cfg.isMany) {
      orderClause = val.orderBy ? ' ' + expandOrderBy(val.orderBy) : '';
    }
    if (cfg.isMany) {
      row[rel] = await query(`SELECT * FROM \`${cfg.table}\` WHERE \`${cfg.joinCol}\` = ?${orderClause}`, [fkValue], conn);
    } else {
      const related = await query(`SELECT * FROM \`${cfg.table}\` WHERE \`${cfg.joinCol}\` = ? LIMIT 1`, [fkValue], conn);
      row[rel] = related[0] || null;
    }
  }
  return row;
}

async function findUnique(model, args, conn) {
  const table = TABLE[model];
  if (!table) return null;
  const w = expandWhere(args?.where);
  const rows = await query(`SELECT * FROM \`${table}\` WHERE ${w.sql} LIMIT 1`, w.params, conn);
  const row = rows[0] || null;
  return row && args?.include ? attachIncludes(model, row, args.include, conn) : row;
}

async function findFirst(model, args, conn) {
  const table = TABLE[model];
  if (!table) return null;
  const w = expandWhere(args?.where);
  const ob = args?.orderBy ? expandOrderBy(args.orderBy) : '';
  const rows = await query(`SELECT * FROM \`${table}\` ${w.sql ? 'WHERE ' + w.sql : ''} ${ob} LIMIT 1`, w.params, conn);
  const row = rows[0] || null;
  return row && args?.include ? attachIncludes(model, row, args.include, conn) : row;
}

async function findMany(model, args, conn) {
  const table = TABLE[model];
  if (!table) return [];
  const w = expandWhere(args?.where);
  const ob = args?.orderBy ? expandOrderBy(args.orderBy) : '';
  const limit = args?.take ? `LIMIT ${Number(args.take)}` : '';
  const offset = args?.skip ? `OFFSET ${Number(args.skip)}` : '';
  let rows = await query(`SELECT * FROM \`${table}\` ${w.sql ? 'WHERE ' + w.sql : ''} ${ob} ${limit} ${offset}`, w.params, conn);
  if (rows && args?.include) {
    rows = await Promise.all(rows.map(r => attachIncludes(model, r, args.include, conn)));
  }
  return rows;
}

async function create(model, args, conn) {
  const table = TABLE[model];
  if (!table) throw new Error(`Unknown model: ${model}`);
  const data = cols(args.data);
  const keys = Object.keys(data);
  const vals = Object.values(data);
  const placeholders = keys.map(() => '?').join(',');
  const result = await exec(
    `INSERT INTO \`${table}\` (${keys.map(k => '`' + k + '`').join(',')}) VALUES (${placeholders})`,
    vals,
    conn
  );
  const pk = PK[table] || 'id';
  const inserted = await query(`SELECT * FROM \`${table}\` WHERE \`${pk}\` = ? LIMIT 1`, [result.insertId], conn);
  let row = inserted[0];
  if (!row) row = camelKeys(data);
  return row && args?.include ? attachIncludes(model, row, args.include, conn) : row;
}

async function update(model, args, conn) {
  const table = TABLE[model];
  if (!table) throw new Error(`Unknown model: ${model}`);
  const data = cols(args.data);
  const w = expandWhere(args.where);
  const setClause = Object.keys(data).map(k => `\`${k}\` = ?`).join(',');
  await exec(
    `UPDATE \`${table}\` SET ${setClause} WHERE ${w.sql}`,
    [...Object.values(data), ...w.params],
    conn
  );
  const rows = await query(`SELECT * FROM \`${table}\` WHERE ${w.sql} LIMIT 1`, w.params, conn);
  const row = rows[0] || null;
  return row && args?.include ? attachIncludes(model, row, args.include, conn) : row;
}

async function updateMany(model, args, conn) {
  const table = TABLE[model];
  if (!table) throw new Error(`Unknown model: ${model}`);
  const data = cols(args.data);
  const w = expandWhere(args.where);
  const setClause = Object.keys(data).map(k => `\`${k}\` = ?`).join(',');
  const result = await exec(
    `UPDATE \`${table}\` SET ${setClause} WHERE ${w.sql}`,
    [...Object.values(data), ...w.params],
    conn
  );
  return { count: result.affectedRows };
}

async function del(model, args, conn) {
  const table = TABLE[model];
  if (!table) throw new Error(`Unknown model: ${model}`);
  const w = expandWhere(args.where);
  const result = await exec(`DELETE FROM \`${table}\` WHERE ${w.sql}`, w.params, conn);
  return { count: result.affectedRows };
}

const deleteMany = del;

async function upsert(model, args, conn) {
  const table = TABLE[model];
  if (!table) throw new Error(`Unknown model: ${model}`);
  const existing = await findFirst(model, { where: args.where }, conn);
  if (existing) {
    return update(model, { where: args.where, data: { ...args.update, ...args.create } }, conn);
  }
  return create(model, { data: { ...args.create, ...args.update } }, conn);
}

async function count(model, args, conn) {
  const table = TABLE[model];
  if (!table) return 0;
  const w = expandWhere(args?.where);
  const rows = await exec(
    `SELECT COUNT(*) AS \`count\` FROM \`${table}\` ${w.sql ? 'WHERE ' + w.sql : ''}`,
    w.params,
    conn
  );
  return Number(rows[0]?.count ?? 0);
}

async function aggregate(model, args, conn) {
  const table = TABLE[model];
  if (!table) throw new Error(`Unknown model: ${model}`);
  const w = expandWhere(args?.where);
  const aggTarget = args._max || args._sum || {};
  const op = args._max ? 'MAX' : 'SUM';
  const field = Object.keys(aggTarget)[0];
  if (!field) return { _max: {}, _sum: {} };
  const rows = await exec(
    `SELECT ${op}(\`${col(field)}\`) AS \`value\` FROM \`${table}\` ${w.sql ? 'WHERE ' + w.sql : ''}`,
    w.params,
    conn
  );
  const result = { _max: {}, _sum: {} };
  if (args._max) result._max[field] = rows[0]?.value ?? null;
  if (args._sum) result._sum[field] = rows[0]?.value ?? null;
  return result;
}

async function groupBy(model, args, conn) {
  const table = TABLE[model];
  if (!table) throw new Error(`Unknown model: ${model}`);
  const byFields = args.by || [];
  const selectCols = byFields.map(f => `\`${col(f)}\``).join(', ');
  const rows = await exec(
    `SELECT ${selectCols}, COUNT(*) AS \`_count\` FROM \`${table}\` GROUP BY ${selectCols}`,
    [],
    conn
  );
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

prisma.$transaction = async function (callback) {
  const conn = await db.pool.getConnection();
  try {
    await conn.beginTransaction();
    const tx = {};
    for (const model of Object.keys(TABLE)) {
      tx[model] = {
        findUnique: (args) => findUnique(model, args, conn),
        findFirst: (args) => findFirst(model, args, conn),
        findMany: (args) => findMany(model, args, conn),
        create: (args) => create(model, args, conn),
        update: (args) => update(model, args, conn),
        updateMany: (args) => updateMany(model, args, conn),
        delete: (args) => del(model, args, conn),
        deleteMany: (args) => del(model, args, conn),
        upsert: (args) => upsert(model, args, conn),
        count: (args) => count(model, args, conn),
        aggregate: (args) => aggregate(model, args, conn),
        groupBy: (args) => groupBy(model, args, conn),
      };
    }
    const result = await callback(tx);
    await conn.commit();
    return result;
  } catch (error) {
    await conn.rollback();
    throw error;
  } finally {
    conn.release();
  }
};

module.exports = prisma;