let currentTargetIndex = 0;

    
    const targetDates = [
      new Date('October 14, 2024 00:00:00'),
        new Date('November 22, 2024 8:00:15'),
        new Date('December 15, 2024 12:00:00'),
        new Date('March 14, 2025 00:00:00'),
        new Date('May 21, 2025 00:00:00')
    ];
    
    
    const arrowLeft = document.querySelector(".arrow-left");
    const arrowRight = document.querySelector(".arrow-right");

    const second = 1000;
    const minute = second * 60;
    const hour = minute * 60;
    const day = hour * 24;

    const dayText = document.getElementById("day");
    const hourText = document.getElementById("hour");
    const minuteText = document.getElementById("minute");
    const secondText = document.getElementById("second");


    function updateCountdown() {
        const now = new Date().getTime();
        const countDate = targetDates[currentTargetIndex].getTime();
        const countdownDiff = now - countDate;
        
        
        if(countdownDiff > 0) {
            const newDayAmount = Math.floor(countdownDiff / day); 
            if(dayText.innerText != String(newDayAmount)) {
                dayText.innerText = newDayAmount;
            };
            const newHourAmount = Math.floor((countdownDiff % day) / hour);
            if(hourText.innerText !== String(newHourAmount)) {
                hourText.innerText = newHourAmount;
            };
            const newMinuteAmount = Math.floor((countdownDiff % hour) / minute);
            if(minuteText.innerText !== String(newMinuteAmount)) {
                minuteText.innerText = newMinuteAmount;
            };
            const newSecondAmount = Math.floor((countdownDiff % minute) / second);
            secondText.innerText = newSecondAmount;

            
            
          //hourAmount = Math.floor((countdownDiff % day) / hour);   
          //minuteAmount = Math.floor((countdownDiff % hour) / minute);   
          //secondAmount = Math.floor((countdownDiff % minute) / second);
        } else {
          dayText.innerText = 0;
          hourText.innerText = 0;
          minuteText.innerText = 0;
          secondText.innerText = 0;
        }
        
    
        // dayText.innerText=dayAmount;
        // hourText.innerText=hourAmount;
        // minuteText.innerText=minuteAmount;
        // secondText.innerText=secondAmount;

    }
 

    function updateTargetDate(offset) {
        currentTargetIndex = (currentTargetIndex + offset + targetDates.length) % targetDates.length;
      }
      
      
      arrowLeft.addEventListener("click", () => {
        updateTargetDate(-1);
        
      });
      
      arrowRight.addEventListener("click", () => {
        updateTargetDate(1);
        
      });
    
updateCountdown();
setInterval(updateCountdown, 1000);
