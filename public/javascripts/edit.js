const editor = new EditorJS({
    tools: {
        header: {
            class: Header,
            config: {
                placeholder: "Enter a header",
                levels: [1, 2, 3, 4, 5, 6],
                defaultLevel: 1,
            },
        },

        image: {
            class: ImageTool,
            config: {
                endpoints: {
                    byFile: "http://localhost:3000/uploadFile", // Your backend file uploader endpoint
                    byUrl: "http://localhost:3000/fetchUrl", // Your endpoint that provides uploading by Url
                },
                field: "avatar",
                type: "image/*",
            },
        },
    },
});

const savbtn = document.querySelector("button");

savbtn.addEventListener("click", function () {
    editor
        .save()
        .then((response) => {
            console.log(response);
        })
        .catch((err) => console.log(err));
});
