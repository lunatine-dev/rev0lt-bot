const { ImgurClient } = require("imgur");
const imgurClient = new ImgurClient({
    clientId: process.env.IMGUR_CLIENT_ID,
});

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
        } else return { album: false, images: [] };
    };
};
