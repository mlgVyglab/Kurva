# Python script that is supposed to be altered by the SMILES to SDF comoutation
import sys
import json
from rdkit import Chem
from rdkit.Chem import Descriptors, AllChem, rdBase, rdMolAlign, rdMolDescriptors
import numpy as np

#--------------------------------------
#   FUNCIONES PYTHON
#--------------------------------------

def generate_conformations(mol):
    AllChem.EmbedMultipleConfs(mol, 1, numThreads=0)
    return mol

# Asume que los smiles recibidos estan separados por espacio
def get_mols_from_smiles(smiles):
    lista_smiles = smiles.split(',')
    lista_mols = [Chem.MolFromSmiles(s) for s in lista_smiles]
    to_return = [Chem.AddHs(m) for m in lista_mols]
    return to_return

# Recibe un string largo con todos los smiles separados por espacio
# y llama al servicio que convierte dichos smiles en mols
# luego llama al servicio que genera las conformaciones  para cada mol
# y obtiene el sdf, el cual concatena a un string 'to_return'. 
# Cada mol tiene su sdf, separados por '$$$$'
def process_incoming_message(smiles):
    to_return = ""
    mols = get_mols_from_smiles(smiles)
    ref_mol = mols[0]
    prob_mols = mols[1:]
    #return smiles+'uno'
    ref_confs = generate_conformations(ref_mol)
    #return smiles+'a'
    prob_confs = [generate_conformations(m) for m in prob_mols]
#    print(len(prob_confs))
    #return smiles+'b'
#    ref_crippen_contribs = rdMolDescriptors._CalcCrippenContribs(ref_mol)
    #return smiles+'c'
#    prob_crippen_contribs = [rdMolDescriptors._CalcCrippenContribs(m) for m in prob_mols]
    #return smiles+'d'
    to_return = Chem.MolToMolBlock(ref_mol)
    for idx, mol in enumerate(prob_mols):
#        tempscore = []
#        for cid in range(200):
#            crippenO3A = rdMolAlign.GetCrippenO3A(mol, ref_mol, prob_crippen_contribs[idx], ref_crippen_contribs, cid, 0)
#            crippenO3A.Align()
#            tempscore.append(crippenO3A.Score())
#        best = np.argmax(tempscore)
#        to_return = to_return +'$$$$'+ Chem.MolToMolBlock(mol, confId=int(best))
        to_return = to_return + '$$$$' + Chem.MolToMolBlock(mol)
    #fd = open('SALIDA.sdf', 'w')
    #fd.write(to_return)
    #fd.close()
    return to_return

def hola(smiles):
    return smiles+'hola!'

#-------------------------------------------------------
#                    JSON STUFF
#-------------------------------------------------------

smiles = 'OCO,O=[N+]([O-])c1ccccc1N=Nc1c(O)ccc2ccccc12,CCC[C@@H](O)CC\C=C\C=C\C#CC#C\C=C\CO,O1C=C[C@H]([C@H]1O2)c3c2cc(OC)c4c3OC(=O)C5=C4CCC(=O)5'
otput = process_incoming_message(smiles)
fd = open('sdf_prueba.sdf','w')
fd.write(otput)
fd.close()

#json_data = " ".join(sys.argv[1:])
# Load  ds input as JSON
#my_data = json.loads(json_data)

#fig = ''

# Adds LOVE at the end of every SMILES formula
#for formula in my_data["formulas"]:
    #formula["smiles"] = formula["smiles"] + 'LOVE'
#    fig = fig + formula['smiles'] + ','

#output = process_incoming_message(fig)

# Print the output to stdout to return it back to Node.js
#print(json.dumps(output))
#sys.stdout.flush()
