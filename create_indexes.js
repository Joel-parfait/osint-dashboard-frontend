// Save as create_indexes_live.js and run with: mongosh < create_indexes_live.js

use leaks_db;

function indexExists(indexName) {
    return db.leakeddata.getIndexes().some(idx => idx.name === indexName);
}

function buildIndex(indexSpec, indexOptions) {
    const idxName = indexOptions.name || JSON.stringify(indexSpec);

    if (indexExists(idxName)) {
        print(`⚡ Index "${idxName}" already exists. Skipping.`);
        return;
    }

    print(`\n🚀 Building index: "${idxName}" ...`);

    const initialIndexSize = db.leakeddata.stats().totalIndexSize;
    const startTime = new Date();

    // Build the index (foreground by default)
    try {
        db.leakeddata.createIndex(indexSpec, indexOptions);

        // Simple live tracking: poll index size until it grows
        let elapsed = 0;
        const pollInterval = 5000; // 5 seconds
        let lastSize = initialIndexSize;
        while (true) {
            const stats = db.leakeddata.stats();
            const currentSize = stats.totalIndexSize;
            if (currentSize > lastSize) {
                const growthMB = ((currentSize - lastSize) / 1024 / 1024).toFixed(2);
                elapsed += pollInterval / 1000;
                print(`  ⏱ ${elapsed}s | Index size +${growthMB} MB`);
                lastSize = currentSize;
            } else {
                break; // index finished growing
            }
            sleep(pollInterval);
        }

        const totalTime = ((new Date() - startTime) / 1000).toFixed(1);
        print(`✅ Index "${idxName}" created in ${totalTime}s`);
    } catch(e) {
        print(`⚠️ Failed to create index "${idxName}": ${e.message}`);
    }
}

print("📊 Starting index creation with live tracking...");

// 1. Text index
buildIndex(
    { name: "text", email: "text", address1: "text", city: "text", town: "text" },
    { name: "text_search_index", weights: { name: 3, email: 2, address1: 1, city: 1, town: 1 } }
);

// 2. Compound indexes
buildIndex({ name: 1, email: 1 }, { name: "name_email_idx" });
buildIndex({ phonenumber: 1, country: 1 }, { name: "phone_country_idx" });
buildIndex({ country: 1, name: 1 }, { name: "country_name_idx" });

// 3. Single field indexes
buildIndex({ country: 1 }, { name: "country_idx" });
buildIndex({ email: 1 }, { name: "email_idx" });
buildIndex({ lower_name: 1 }, { name: "lower_name_idx" });

// 4. Optional normalized phone
buildIndex({ normalized_phone: 1 }, { name: "normalized_phone_idx" });

// 5. Final stats
print("\n📊 All indexes (current):");
db.leakeddata.getIndexes().forEach(idx => print(` - ${idx.name}: ${JSON.stringify(idx.key)}`));

const stats = db.leakeddata.stats();
print(`\n📈 Collection stats:`);
print(`  Total documents: ${stats.count.toLocaleString()}`);
print(`  Total size: ${(stats.size / 1024 / 1024 / 1024).toFixed(2)} GB`);
print(`  Total index size: ${(stats.totalIndexSize / 1024 / 1024).toFixed(2)} MB`);
print(`  Number of indexes: ${stats.nindexes}`);

print("\n✅ Index creation complete!");
