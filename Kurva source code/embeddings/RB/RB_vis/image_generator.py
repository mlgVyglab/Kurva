from rdkit import Chem
from rdkit.Chem import Descriptors
from rdkit.Chem import rdMolDescriptors
from rdkit.Chem import Draw

smiles = open('rb/smiles.smi')
line = smiles.readline()

salida = open('rb/descriptors.csv','w')
i = 0
while(line):
	mol = Chem.MolFromSmiles(line)
	img = Draw.MolToImage(mol,useSVG=False)
	img.save('./images/'+str(i)+'.png')
	#img = Draw.MolToImage(mol,useSVG=True)
	#img.save('./images/'+str(i)+'.svg')  
	line = smiles.readline()
	i+=1	
salida.close()

