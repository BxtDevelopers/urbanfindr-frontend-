"""Optional refresh of bundled stock photography. App runtime never downloads assets."""
import concurrent.futures,json,urllib.request
from pathlib import Path
ROOT=Path(__file__).resolve().parents[1]
ASSETS={
 'hero-home':('1600585154340-be6161a56a0c','Contemporary house exterior'),
 'house-1':('1600596542815-ffad4c1539a9','Modern house with landscaped garden'),
 'house-2':('1600047509807-ba8f99d2cdde','Residential home exterior'),
 'apartment-1':('1600566753086-00f18fb6b3ea','Residential interior'),
 'living-1':('1600210492486-724fe5c67fb0','Living room'),
 'living-2':('1600607687939-ce8a6c25118c','Contemporary living space'),
 'kitchen-1':('1556912172-45b7abe8b7e1','Kitchen interior'),
 'kitchen-2':('1565538810643-b5bdb714032a','Modular kitchen'),
 'bedroom-1':('1566665797739-1674de7a421a','Furnished bedroom'),
 'bedroom-2':('1611892440504-42a792e24d32','Bedroom with twin sleeping areas'),
 'bedroom-3':('1631049307264-da0ec9d70304','Bedroom interior'),
 'wardrobe-1':('1558997519-83ea9252edf8','Wardrobe and clothing storage'),
 'wardrobe-2':('1595526114035-0d45ed16cfbf','Bedroom storage and furniture'),
 'office-1':('1497366754035-f200968a6e72','Contemporary office workspace'),
 'office-2':('1497366811353-6870744d04b2','Office workspace'),
 'builder-1':('1460317442991-0ec209397118','Multi-storey residential architecture'),
 'commercial-1':('1486406146926-c627a92ad1ab','Commercial building exterior'),
}
def download(item):
 name,(photo,description)=item
 url=f'https://images.unsplash.com/photo-{photo}?auto=format&fit=crop&w=1440&q=82'
 destination=ROOT/'public/photos'/f'{name}.jpg';destination.parent.mkdir(parents=True,exist_ok=True)
 try:
  if not destination.exists():
   request=urllib.request.Request(url,headers={'User-Agent':'Mozilla/5.0'})
   with urllib.request.urlopen(request,timeout=40) as response:
    content=response.read()
    if not response.headers.get('Content-Type','').startswith('image/') or len(content)<10000:raise ValueError('Invalid image response')
    destination.write_bytes(content)
  return {'name':name,'path':f'/photos/{name}.jpg','source':url,'description':description,'bytes':destination.stat().st_size}
 except Exception as error:return {'name':name,'error':str(error)}
if __name__=='__main__':
 with concurrent.futures.ThreadPoolExecutor(max_workers=6) as executor:results=list(executor.map(download,ASSETS.items()))
 (ROOT/'public/photos/sources.json').write_text(json.dumps(results,indent=2)+'\n')
 for result in results:print(result['name'],result.get('bytes',result.get('error')))
 if any('error' in item for item in results):raise SystemExit(1)
