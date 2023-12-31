const { ImgurClient } = require("imgur");
const imgurClient = new ImgurClient({
    clientId: process.env.IMGUR_CLIENT_ID,
});

const axios = require("axios");
const Evidence = require("../models/Evidence");
const User = require("../models/User");

module.exports = (client) => {
    client.uploadToImgurAlbum = async (desc, imageAttachments) => {
        const res = await imgurClient.createAlbum("Rev0lt evidence", desc);

        if (res.success) {
            const albumId = res.data.id;
            const deleteHash = res.data.deletehash;
            let images = [];
            let promises = [];

            for (const attachment of imageAttachments.values()) {
                try {
                    const uploadRes = await imgurClient.upload({
                        image: attachment.url,
                        album: deleteHash,
                    });

                    // Assuming uploadRes.success is a property indicating success
                    if (uploadRes.success) {
                        images.push(uploadRes.data.link);
                    } else {
                        console.error("Failed to upload image", uploadRes);
                    }
                } catch (e) {
                    console.error("Error uploading image", e);
                }
            }

            return { album: `https://imgur.com/a/${albumId}`, images };
        } else {
            console.log(res);
            return { album: false, images: [] };
        }
    };

    client.uploadToServer = async (author, member, desc, imageAttachments) => {
        const response = await axios.post(
            `${process.env.BACKEND_URL}/evidence`,
            {
                urls: imageAttachments.map((attachment) => attachment.url),
            }
        );

        if (response.status >= 200 && response.status < 300) {
            //success

            const images = response.data.map(
                (imgPath) => `${process.env.BACKEND_URL}${imgPath}`
            );

            let user = await User.findOne({
                identifier: author.id,
            });

            if (!user) {
                //create user
                user = await new User({
                    identifier: author.id,
                    username: author.username,
                    displayName: member
                        ? member.displayName
                        : author.displayName,
                    avatar: author.displayAvatarURL({
                        size: 256,
                    }),
                    points: 0,
                    total_points: 0,
                }).save();
            }

            const evidence = new Evidence({
                text: desc,
                images: response.data,
                user: user._id,
            });

            await evidence.save();

            return {
                album: `https://rev0lt.astatine.moe/evidence/${evidence._id}`,
                images,
            };
        } else {
            //fail
            return {
                images: [],
            };
        }
    };
};
