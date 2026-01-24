const argon2 = require("argon2");
const crypto = require("crypto");

exports.GenerateSalt = (keyingMaterial) => {
    return crypto.createHmac(
                "sha256" , 
                process.env.SALT_SECRET_KEY
            )
            .update(keyingMaterial)
            .digest();
}

exports.GenerateHash = async (value) => {
    const salt = this.GenerateSalt(value);
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

exports.VerifyHash = async(raw , hash) => {
    const new_hash = await this.GenerateHash(raw);

    return crypto.timingSafeEqual(
        Buffer.from(hash),
        Buffer.from(new_hash)
    );
}

