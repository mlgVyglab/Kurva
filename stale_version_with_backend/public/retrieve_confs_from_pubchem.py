from sys import argv
import pubchempy as pcp

dataset = argv[1]
i = int(argv[2])
smiles = open(dataset+'/smiles.smi','r')
#error = open('error_'+dataset+'.txt','w')
#cids = open('cids_sin_sal_'+dataset+'.csv','w')

for j in range(i):
    s = smiles.readline()[:-1]

while(s):
    cid = pcp.get_compounds(s, 'smiles')
    if ((len(cid)==0) or (cid[0].cid ==None)):
        #error.write(str(i) + ' ' + s + '\n')
        print('error en : ' + str(i))
    else:
        cid = cid[0].cid
        #cids.write(str(i) + ',' + str(cid) + '\n')
        print(str(i)+' '+ s + ' ' + str(cid))
        #pcp.download('SDF', dataset + '/' + str(i) + '_' + str(cid) + '.sdf', s, 'smiles', record_type = '3d', overwrite = True)

    s = smiles.readline()[:-1]
    i = i+1
#error.close()
#cids.close()
