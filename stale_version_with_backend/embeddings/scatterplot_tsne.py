import numpy as np
import pandas as pd
from sklearn.manifold import TSNE
from sklearn.preprocessing import StandardScaler
from sklearn.cluster import DBSCAN
import matplotlib.pyplot as plt
from sklearn.metrics import pairwise_distances

embeddings = pd.read_csv('./RB/embeddings.csv')
actividades = pd.read_csv('./RB/labels.csv', header=None)
descriptores = pd.read_csv('./RB/descriptors.csv', header=None)

smiles = embeddings.iloc[:,1].values
embeddings_compuestos = embeddings.iloc[:,2:].values
actividades = actividades.values.reshape(actividades.values.shape[0],1)
descriptores = descriptores.iloc[:,1:].values


scaler = StandardScaler()

embeddings_compuestos_scaled = scaler.fit_transform(embeddings_compuestos)

# print(np.std(pairwise_distances(embeddings_compuestos_scaled)))
# print(np.mean(pairwise_distances(embeddings_compuestos_scaled)))

X_embedded = TSNE(n_components=2, perplexity = 10).fit_transform(embeddings_compuestos_scaled)

clustering = DBSCAN(eps=6.5, min_samples=5).fit(X_embedded)

labels = clustering.labels_
# print(np.count_nonzero(np.where(labels == -1)))
# 

# cdict_actividad = {'RB':'green', 'NRB':'red'}

# valores_clusters = np.unique(labels)
# valores_actividad = ['RB', 'NRB']

# x = X_embedded[:,0]
# y = X_embedded[:,1]

# fig, ax = plt.subplots()                                      
# for g in valores_clusters:                                             
# 	ix = np.where(labels == g)                    
# 	ax.scatter(x[ix], y[ix], label = g, s = 10)

# ax.legend()

# fig2, ax2 = plt.subplots()                                      
# for g in valores_actividad:                                             
# 	ix = np.where(actividades == g) 
# 	ax2.scatter(x[ix], y[ix], c = cdict_actividad[g], label = g, s = 10)

# ax2.legend()
# plt.show()

# Ahora dumpeo la info para hacer el plot
smiles = smiles.reshape(smiles.shape[0],1)
labels = labels.reshape(labels.shape[0],1)
datos = np.concatenate([smiles,X_embedded,descriptores,labels,actividades], axis=1)
datos = pd.DataFrame(data = datos, columns = ['SMILES','tSNE_0','tSNE_1','LogP','Mol Weight','Heavy Atom Count', '\# Aromatic Rings','\# Rotatable Bonds','Cluster','Bioactivity'])
datos.to_csv('rb_dataset.csv')