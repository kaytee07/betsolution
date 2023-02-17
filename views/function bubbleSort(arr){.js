function bubbleSort(arr){
    let num = 0;
    for(let i = arr.length; i > 0 ; i--){
        console.log(i)
        for(let j = 0; j < i-1; j++){
            if(arr[j] > arr[j+1]){
                let tmp = arr[j+1];
                arr[j+1] = arr[j];
                arr[j] = tmp
            }
        }
    }
    console.log(arr)
}






bubbleSort(["z","a","q","b","y"])