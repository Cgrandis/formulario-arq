import bcrypt from 'bcrypt';
import { db } from '@vercel/postgres';
import { users, forms } from '../lib/placeholder-data';

const client = await db.connect();

async function seedUsers() {
    await client.sql`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`;
    await client.sql`
      CREATE TABLE IF NOT EXISTS users (
        id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email TEXT NOT NULL UNIQUE,
        password TEXT NOT NULL
      );
    `;
  
    const insertedUsers = await Promise.all(
      users.map(async (user) => {
        const hashedPassword = await bcrypt.hash(user.password, 10);
        return client.sql`
          INSERT INTO users (id, name, email, password)
          VALUES (${user.id}, ${user.name}, ${user.email}, ${hashedPassword})
          ON CONFLICT (id) DO NOTHING;
        `;
      }),
    );
  
    return insertedUsers;
  }

  async function seedForms() {
    await client.sql`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`;
  
    await client.sql`
    CREATE TABLE IF NOT EXISTS forms (
      id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
      projeto TEXT NOT NULL,
      municipio TEXT NOT NULL,
      uf TEXT NOT NULL,
      coord_e NUMERIC NOT NULL,
      coord_s NUMERIC NOT NULL,
      sondagem_no NUMERIC NOT NULL,
      data DATE NOT NULL,
      hidrografia TEXT,
      situacao TEXT,
      margem TEXT,
      tipografia_terreno TEXT,
      vegetacao TEXT,
      nivel_1 NUMERIC,
      codigo_munsell TEXT,
      solo TEXT,
      exposicao_solo NUMERIC,
      compactacao TEXT,
      ocorrencias TEXT,
      lencol_freatico TEXT,
      nivel_2_cm NUMERIC,
      nivel_2_cm_a NUMERIC,
      codigo_munsell_2 TEXT,
      solo_2 TEXT,
      compactacao_2 TEXT,
      ocorrencias_2 TEXT,
      lencol_freatico_2 TEXT,
      potencial_arqueologico TEXT,
      potencial_arqueologico_qual TEXT,
      observacao TEXT,
      registro_fotografico TEXT
    );
  `;
  
  const insertedForms = await Promise.all(
    forms.map(
      (form) => client.sql`
        INSERT INTO forms (
          projeto, municipio, uf, coord_e, coord_s, sondagem_no, data, hidrografia,
          situacao, margem, tipografia_terreno, vegetacao, nivel_1, codigo_munsell,
          solo, exposicao_solo, compactacao, ocorrencias, lencol_freatico,
          nivel_2_cm, nivel_2_cm_a, codigo_munsell_2, solo_2, compactacao_2,
          ocorrencias_2, lencol_freatico_2, potencial_arqueologico, potencial_arqueologico_qual,
          observacao, registro_fotografico
        ) VALUES (
          ${form.projeto}, ${form.municipio}, ${form.uf}, ${form.coord_e}, ${form.coord_s},
          ${form.sondagem_no}, ${form.data}, ${form.hidrografia}, ${form.situacao},
          ${form.margem}, ${form.tipografia_terreno}, ${form.vegetacao}, ${form.nivel_1},
          ${form.codigo_munsell}, ${form.solo}, ${form.exposicao_solo}, ${form.compactacao},
          ${form.ocorrencias}, ${form.lencol_freatico}, ${form.nivel_2_cm}, ${form.nivel_2_cm_a},
          ${form.codigo_munsell_2}, ${form.solo_2}, ${form.compactacao_2}, ${form.ocorrencias_2},
          ${form.lencol_freatico_2}, ${form.potencial_arqueologico}, ${form.potencial_arqueologico_qual},
          ${form.observacao}, ${form.registro_fotografico}
        )
        ON CONFLICT (id) DO NOTHING;
      `
    )
  );

  return insertedForms;
}

  export async function GET() {
    try {
      await client.sql`BEGIN`;
      await seedUsers();
      await seedForms();
      await client.sql`COMMIT`;
  
      return Response.json({ message: 'Database seeded successfully' });
    } catch (error) {
      await client.sql`ROLLBACK`;
      return Response.json({ error }, { status: 500 });
    }
  }
  