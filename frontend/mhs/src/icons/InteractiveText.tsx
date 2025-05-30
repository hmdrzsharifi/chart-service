const InteractiveText = (props: { selected: boolean, color: string }) => {
    return (<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 28 28" width="28" height="28">
            <path fill="currentColor"
                  d="m9.5 5C8.68 5 8 5.67 8 6.5v2h1v-2c0-.27.23-.5.5-.5H14v16h-2v1h5v-1h-2V6h4.5c.28 0 .5.22.5.5v2h1v-2c0-.83-.67-1.5-1.5-1.5h-10z">
            </path>
        </svg>

    )
}

export default InteractiveText;