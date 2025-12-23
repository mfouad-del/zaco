import { PrismaClient } from '@prisma/client';

(async function main(){
  const prisma = new PrismaClient();
  try{
    console.log('Starting dedupe companies job');
    const all = await prisma.company.findMany({ orderBy: { createdAt: 'asc' } });
    const map = new Map<string, any[]>();
    for(const c of all){
      const key = (c.nameEn || '').trim().toLowerCase();
      if(!map.has(key)) map.set(key, []);
      map.get(key)!.push(c);
    }

    for(const [key, list] of map.entries()){
      if(list.length <= 1) continue;
      console.log(`Found duplicates for "${key}": ${list.map(x=>x.id).join(',')}`);
      const keeper = list[0];
      const duplicates = list.slice(1);

      for(const dup of duplicates){
        console.log(`Reassigning users and correspondences from ${dup.id} -> ${keeper.id}`);
        await prisma.user.updateMany({ where: { companyId: dup.id }, data: { companyId: keeper.id } });
        await prisma.correspondence.updateMany({ where: { companyId: dup.id }, data: { companyId: keeper.id } });
        console.log(`Deleting duplicate company ${dup.id}`);
        await prisma.company.delete({ where: { id: dup.id } });
      }
    }

    console.log('Dedupe completed');
  }catch(err){
    console.error('Dedupe failed', err);
  }finally{
    await prisma.$disconnect();
  }
})();
