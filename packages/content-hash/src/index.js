import {createHash} from 'crypto';

export default getHash=>{
    return {
        name: 'content-hash',
        generateBundle: function(options = {}, bundle = {}, isWrite = false) {
            if (!isWrite) {
                return 
            }
            const updateBundle = (key,value) => {
                if (!value.code) {
                    //Maybe add asset support later
                    return;
                }

                const currentHash = getHash(key)
                if (currentHash === value.fileName) {
                    return;
                }
                   
                const newKey = key.replace(currentHash,createHash('sha256').update(value.code).digest('hex').substring(0,10))
                console.log(currentHash,key,newKey)
                
                value.fileName = newKey
                //TODO: if file exists we would throw this out of the bundle! no need to rewrite that file
                bundle[newKey] = value
                delete bundle[key]
                Object.values(bundle).map(currentValue=>{
                    if (currentValue.imports.includes(key)) {
                        currentValue.imports = [...currentValue.imports.filter(x => x !== key),newKey]
                    }
                    if (currentValue.dynamicImports.includes(key)) {
                        currentValue.dynamicImports = [...currentValue.dynamicImports.filter(x => x !== key),newKey]
                    }
                    if (currentValue.implicitlyLoadedBefore.includes(key)) {
                        currentValue.implicitlyLoadedBefore = [...currentValue.implicitlyLoadedBefore.filter(x => x !== key),newKey]
                    }
                    if (currentValue.code.indexOf(key) > -1) {
                        currentValue.code = currentValue.code.split(key).join(newKey)
                        updateBundle(currentValue.fileName,currentValue)
                    }
                })
            }

            for (const [key, value] of Object.entries(bundle)) {
                // only works with none asset chunks assets have source
                updateBundle(key,value)
            }

            console.log(bundle)
        }
    }
}

