from rdkit import Chem
from rdkit.Chem import Descriptors
from rdkit.Chem import rdMolDescriptors

smiles = open('rb/smiles.smi')
line = smiles.readline()

salida = open('rb/descriptors.csv','w')

while(line):
	print(line)
	mol = Chem.MolFromSmiles(line)
	logp = Descriptors.MolLogP(mol)
	molwt = Descriptors.MolWt(mol)
	hac = Descriptors.HeavyAtomCount(mol)
	ar = rdMolDescriptors.CalcNumAromaticRings(mol)
	rb = rdMolDescriptors.CalcNumRotatableBonds(mol)
	lista = [line[:-1],logp, molwt,hac,ar,rb]
	salida.write(','.join([str(elem) for elem in lista])+'\n')
	line = smiles.readline()	
salida.close()

