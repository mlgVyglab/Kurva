import sys
import json
from rdkit import Chem
from rdkit.Chem import rdFMCS, AllChem
import pickle as pkl
import os

#-----------------------------------------------------------------------
#                    PYTHON  FUNCTIONS - SDF & ALIGNMENT
#-----------------------------------------------------------------------

# Step 0 - generate a list of molecules based on a long string of smiles
def generate_list_of_mols(whole_string_of_smiles):
    # Assume my whole string of smiles has all smiles separated by ','
    s = whole_string_of_smiles.split(',')
    m = [Chem.MolFromSmiles(elem) for elem in s]
    return m

# Step 1 - find Maximum Common Substructure (MCS)
def find_mcs(whole_string_of_smiles):
    m = generate_list_of_mols(whole_string_of_smiles)
    res = rdFMCS.FindMCS(m)
    return res.smartsString

# Step 2 - calculate 3D conformations for received compounds using RDKit
def calculate_3D_conformations(whole_string_of_smiles):
    m = generate_list_of_mols(whole_string_of_smiles)
    m_h = [Chem.AddHs(i) for i in m]

    # Calculate the actual 3D conformations
    list_of_mols_with_conformations = []
    for mol_h in mh:
        AllChem.EmbedMolecule(mol_h)
        list_of_mols_with_conformations.append(mol_h)

    # Elaborate the sdf strings, separating ref mol from prob mols
    ref_mol = list_of_mols_with_conformations[0]
    prob_mols = list_of_mols_with_conformations

    ref_mol_sdf = Chem.MolToMolBlock(ref_mol)
    prob_mols_sdf = ''
    for conf in list_of_mols_with_conformations:
        prob_mols_sdf = prob_mols_sdf + Chem.MolToMolBlock(conf) + '\n$$$$\n'

    to_return = (ref_mol_sdf, prob_mols_sdf)
    return to_return

# Step 2 - get 3D conformations from a precomputed pool
def get_precomputed_3D_conformations(whole_string_of_smiles):
    # Always assuming my smiles are concatenated and separated by ','
    s = whole_string_of_smiles.split(',')

    # separate ref from prob compounds
    ref_compound = s[0]
    prob_compounds = s

    # get precomputed conformations - Using dictionary_all_data.p
    dict_conformations = pkl.load(open(os.getcwd()+'/public/resources/dictionaries/dictionary_all_data.p','rb'))
    ref_sdf = dict_conformations.get(ref_compound)
    prob_sdf = ''
    for c in prob_compounds:
        c_sdf = dict_conformations.get(c)
        prob_sdf = prob_sdf + c_sdf + '\n'

    to_return = (ref_sdf, prob_sdf)
    return to_return

# Step 3 - call obfit command for molecular alignment
def calculate_molecular_alignment(whole_string_of_smiles):
    mcs_SMARTS_pattern = find_mcs(whole_string_of_smiles)
    ref_sdf, prob_sdf = get_precomputed_3D_conformations(whole_string_of_smiles)

    # dump temporary sdf files for obfit's use 
    # (will be overwritten with each call of this fn)
    ref_file_path = os.getcwd()+'/public/temp/ref_sdf.sdf'
    prob_file_path = os.getcwd()+'/public/temp/prob_sdf.sdf'
    output_file_path = os.getcwd()+'/public/temp/aligned_sdf.sdf'

    ref_fd = open(ref_file_path,'w')
    ref_fd.write(ref_sdf)
    ref_fd.close()

    prob_fd = open(prob_file_path,'w')
    prob_fd.write(prob_sdf)
    prob_fd.close()

    # actual alignment - needs all these auxiliary files to work :(
    outcome = os.system('obfit \'' + mcs_SMARTS_pattern + '\' ' + ref_file_path + ' ' + prob_file_path + ' > ' + output_file_path)

    # debug
    #print(mcs_SMARTS_pattern)
    #print(outcome)

    aligned_sdf_string = open(output_file_path, 'r').read()
    return aligned_sdf_string
#    return 'hola!'

# For debugging purposes only
def hola(smiles):
    return smiles+'hola!'

#----------------------------------------------------------------------------
#                 COMMUNICATION WITH THE WEB SERVICE VIA JSON
#----------------------------------------------------------------------------

json_data = ' '.join(sys.argv[1:])
# Load ds input as JSON
my_data = json.loads(json_data)

whole_string_of_smiles = ''

#hardcodeado - ver si lo podemos arreglar
forbidden_smiles = ['CC[C@H](C)[C@@H]1NC(=O)[C@@H]2CCCN2C(=O)[C@H](Cc2ccccc2)N(C)C(=O)[C@H](Cc2ccccc2)NC(=O)[C@H](C(C)C)N(C)C(=O)[C@@H]([C@@H](C)CC)OC(=O)CN(C)C(=O)[C@H](CC(C)C)NC(=O)[C@H](C(C)C)N(C)C1=O','CC[C@H](C)[C@H]1O[C@]2(CC[C@@H]1C)C[C@@H]1C[C@@H](C/C=C(\C)[C@@H](O[C@H]3C[C@H](OC)[C@@H](O[C@H]4C[C@H](OC)[C@@H](O)[C@H](C)O4)[C@H](C)O3)[C@@H](C)/C=C/C=C3\CO[C@@H]4[C@H](O)C(C)=C[C@@H](C(=O)O1)[C@]34O)O2.CO[C@H]1C[C@H](O[C@H]2[C@H](C)O[C@@H](O[C@@H]3/C(C)=C/C[C@@H]4C[C@@H](C[C@]5(CC[C@H](C)[C@@H](C(C)C)O5)O4)OC(=O)[C@@H]4C=C(C)[C@@H](O)[C@H]5OC/C(=C\C=C\[C@@H]3C)[C@@]45O)C[C@@H]2OC)O[C@@H](C)[C@@H]1O']

for formula in my_data["formulas"]:
    if not formula["smiles"] in forbidden_smiles:
        whole_string_of_smiles = whole_string_of_smiles + formula["smiles"] + ','

whole_string_of_smiles=whole_string_of_smiles[:-1]
whole_string_of_smiles = 'CN1CC[C@]23c4c5ccc(O)c4O[C@H]2[C@@H](O)C=C[C@H]3[C@H]1C5,C[C@]12C[C@H](O)[C@H]3[C@@H](CCC4=CC(=O)CC[C@@]43C)[C@@H]1CC[C@]2(O)C(=O)CO,COCO[C@@H]1CC(=O)OC[C@H](C)C(=O)O[C@@H](C(C)C)C(=O)N(C)[C@H]1Cc1ccccc1,C[C@@H]1C(=O)OCC(=O)N(C)[C@@H](Cc2ccccc2)[C@@H](O)CC(=O)O[C@@H]1C'

output = calculate_molecular_alignment(whole_string_of_smiles)
d = {'output':output}

# Print the output to stdout to return it back to Node.js
print(json.dumps(d))
sys.stdout.flush()
