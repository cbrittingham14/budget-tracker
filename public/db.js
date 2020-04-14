
let db; //set blank global let to assign db during request.onsuccess 
const request = indexedDB.open("budget", 1);


request.onupgradeneeded = e => {
	const db = e.target.result;
	db.createObjectStore('pending', { autoIncrement: true });
};

//function to save to indexedDb
//called when fetch request fails (assuming internet is down)
function save(data){
	const trans = db.transaction(['pending'], 'readwrite');
	const store = trans.objectStore('pending');
	store.add(data);
};

//key function to check indexedDb
function checkDb() {

	const trans = db.transaction(['pending'], 'readwrite');
	const store = trans.objectStore('pending');
	const all = store.getAll();

		// if there are any items in the store post them all to the database
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

// called when indexedDb is successfully opened
request.onsuccess = e => {
	db = e.target.result; //set db to indexedDb instance
	if(navigator.onLine){
		checkDb();
	}
};

request.onerror = e => {
  console.log('== ERROR ==> ', e.target.errorCode);
};

// call checkDb when online connection returns
window.addEventListener('online', checkDb);