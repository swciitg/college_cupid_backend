const argon2 = require("argon2");
const crypto = require("crypto");

const GenerateSalt = (keyingMaterial) => {
    return crypto.createHmac(
                "sha256" , 
                process.env.SALT_SECRET_KEY
            )
            .update(keyingMaterial)
            .digest();
}

const GenerateHash = async (value) => {
    const salt = GenerateSalt(value);
    const hash = await argon2.hash(value , {
        salt,
        memoryCost : 2 ** 14, // in kb
        timeCost : 3 ,
        parallelism : 1 ,
        hashLength : 32 ,
        type: argon2.argon2id 
    });
    return hash;
}

const VerifyHash = async(raw , hash) => {
    const new_hash = await GenerateHash(raw);

    return crypto.timingSafeEqual(
        Buffer.from(hash),
        Buffer.from(new_hash)
    );
}

module.exports = {GenerateHash , VerifyHash};