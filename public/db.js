
let db; //set blank global let to assign db during request.onsuccess 
const request = indexedDB.open("budget", 1);

request.onupgradeneeded = e => {
	const db = e.target.result;
	db.createObjectStore('pending', { autoIncrement: true });
};

function save(data){
	const trans = db.transaction(['pending'], 'readwrite');
	const store = trans.objectStore('pending');
	store.add(data);
};

function checkDb() {

	const trans = db.transaction(['pending'], 'readwrite');
	const store = trans.objectStore('pending');
	const all = store.getAll();

		all.onsuccess = () => {
			if (all.result.length > 0){
				fetch('/api/transaction/bulk', {
					method: 'POST',
					body: JSON.stringify(all.result),
					headers: {
						Accept: 'application/json, text/plain, */*',
						'Content-Type': 'application/json'
					}
				})
				.then(r => r.json())
				.then(()=> {
					//clear all items from object store on successful api post
					const t = db.transaction(['pending'], 'readwrite');
					const s = t.objectStore('pending');
					s.clear();

				}).catch(err => console.log('Error: ', err));
			}
		};
};
request.onsuccess = e => {

	db = e.target.result; //set db to indexedDb instance
	if(navigator.onLine){
		checkDb();
	}
};

request.onerror = e => {
  console.log('== ERROR ==> ', e.target.errorCode);
};

// check indexedDB when window goes online
window.addEventListener('online', checkDb);