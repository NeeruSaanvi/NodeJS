<?php
defined('BASEPATH') OR exit('No direct script access allowed');

	class Lottery extends CI_Controller {

		function __construct(){
			parent:: __construct();
			$this->load->helper(array('form', 'url','custom_helper'));
			$this->load->database(); 
			$this->load->model('Lottery_Modal');
			$this->load->library('session');
			$this->load->helper('cookie');
			header('Access-Control-Allow-Origin: *');
		}
    public function log_out(){
			$session_destroy = session_destroy();
			if($session_destroy==TRUE){
			redirect(base_url('lottery/index'));
		 }
    }
		public function index()
		{  
			date_default_timezone_set("Asia/Calcutta");
			$this->load->view('header');
			$data['posts'] = $this->Lottery_Modal->select_data('result');
			$this->load->view('Home/Home',$data);
			$this->load->view('footer');
		}

		public function bat_submit()
		{   
			 $bat_nature = $this->input->post('bat_nature');
			 $bat_type   = $this->input->post('bat_type');
			 $bat_amount = $this->input->post('bat_amount');
			 $bat_count  = $this->input->post('bat_count');
			 $bat_total  =  $this->input->post('bat_total');
			 $bat_sequence_no  =  $this->input->post('bat_sequence_no');
			 
			 $bat_numbers0  =  $this->input->post('bat_numbers0');
			 $bat_numbers1  =  $this->input->post('bat_numbers1');
			 $bat_numbers2  =  $this->input->post('bat_numbers2');
			 $bat_numbers3  =  $this->input->post('bat_numbers3');
			 $bat_numbers4  =  $this->input->post('bat_numbers4');
			 
			 $nature='';
			 if($bat_nature==1){
				 $nature ="S";
			 }else if($bat_nature==2){
				$nature ="B";
			 }

			 
			 if($bat_type==1){
				$nature = $nature."O";
			}else if($bat_type==2){
			 $nature = $nature."E";
			}


     
			$multidimension_array = array(); 
			$String = $bat_numbers0."|".$bat_numbers1."|".$bat_numbers2."|".$bat_numbers3."|".$bat_numbers4;
			$parents = explode("|",$String);
			$parent = implode(" ",$parents);
			if(trim($nature)=='' || $nature==null){
				$betcontent = $parent;
			}else if(trim($parent)=='' || $parent==null){$betcontent = $nature;}else
			$betcontent = $nature.'/'.$parent;
			$betcontent= trim($betcontent,'/');
			$bat_transaction_response  =  $this->input->post('response');
			if(!empty($bat_numbers0) || $bat_nature !=0 || $bat_type!=0){
			   $session = $this->session->userdata('session_data') ; //Retrive ur session
				 $batter_name = $session['name'];
				 $batter_wallet = $session['account'];
				
				 $insert_winner_summery = array("orderNumber"=>'100' , "betNumber"=>$bat_sequence_no, "result"=>'' , "userId"=>$batter_name, "betContent"=>$betcontent, "type"=>'Bet', "amount"=>$bat_total);
			   $winnerresultSummary = $this->Lottery_Modal->insert_funtion('betSummery', $insert_winner_summery);
				 
				 //$insert_winner_summery = "insert into betSummery (betNumber,result,userId,betContent,type,amount,orderNumber) select '$blocknumber','$newNumber','$winner_login_id', betContent,'Win','$reward','100' from betSummery where userId='$winner_login_id' and betNumber='$blocknumber' limit 1)";
				 //$winnerresultSummary = mysqli_query($con, $insert_winner_summery);	 
				
				$data = array("bat_login_id"=>$batter_name,"batter_wallet"=>$batter_wallet,"bat_nature"=>$bat_nature,"bat_type"=>$bat_type,"bat_amount"=>$bat_amount,"bat_transaction_response"=>$bat_transaction_response,"bat_count"=>$bat_count,"bat_total"=>$bat_total,"bat_sequence_no"=>$bat_sequence_no);
			  $result = $this->Lottery_Modal->insert_funtion('bats',$data);
			  if($result==true){
			   $last_inserted_bat_id = $this->db->insert_id();
					
					for($a=0;$a<count($parents);$a++){
						if(trim($parents[$a])!=""){
							$newbatarray = explode(' ',$parents[$a]);
							
							for($i=0;$i<count($newbatarray)-1;$i++){
								if(trim($newbatarray[$i])!=""){
								$bat_number = $newbatarray[$i];
								$bats_number_data = array("bat_id"=>$last_inserted_bat_id,"bets_type"=>$a,"bat_numbers"=>$bat_number);	
								$bat_number_result = $this->Lottery_Modal->insert_funtion('bat_numbers',$bats_number_data);
							 }
							}
						}	
					}
					echo "sucess"; 
				}
			 else{
				echo "false";
              }
		    }
			 else{
			    echo "you are not select bet number.";  	 
			 }
		}
		
		function check_lottery_information(){
			header('Content-Type: application/json');
			if($this->input->is_ajax_request() && $this->input->post()){				
				$output = gettransaction();
				$jsondata = json_decode($output);
				if(count($jsondata)>0){
					$status = $jsondata->status;
					$txn = $jsondata->txn;
					$blockNumber = $txn->blockNumber;
					$Hashkey = $txn->txHash;
					$Hashkey;
					$time = $txn->timestamp;
					$result_id ='';
					$block_number =  $this->input->post('block_number');
					if($status==200 && $blockNumber > $block_number && $txn!=null){
						$lastdigit = substr($Hashkey, -1);
						if(is_numeric($lastdigit)){
							$lastnumber = $lastdigit;
							$lastId = $this->input->post('lastid');							
							$this->db->select('*');
							$this->db->from('result');
							$this->db->where('result_id',$lastId);
							$query = $this->db->get();
							if($query->num_rows()>0){
								$response = $query->result_array();
								$row = $response[0];
								$result_id = $row["result_id"];
								$digitnumber = trim($row["result_number"]);
								$blockNumber = $row["result_serial_no"];
								$digitlength = strlen($digitnumber);            
								if($digitlength < 5){
									$newdigitnumber = $digitnumber.$lastdigit;  
									$number_update_sql = "UPDATE result SET result_number = CONCAT(result_number, '$lastnumber') WHERE result_id=$result_id";
									if ($this->db->query($number_update_sql)) {
										$response = array('status' =>true,'msg'=>'Number updated successfully','number'=>$newdigitnumber,'result'=>$jsondata);
									}
								}else{
									$blockNumber = $blockNumber+1;
									$insert_sql = "INSERT INTO result (result_serial_no,result_number,result_time)VALUES ($blockNumber,$lastnumber,'$time')"; 
									$this->db->query($insert_sql);
									$response = array('status' =>true,'msg'=>'Record inserted','number'=>$lastnumber,'result'=>$jsondata);
								}
							}else{
								$response = array('status' =>false,'msg'=>'No Record found','number'=>'','result'=>$jsondata);
							}
						}else{
							$response = array('status' =>false,'msg'=>'Invalid Number','number'=>'','result'=>$jsondata);
						}
					}else{
						$response = array('status' =>false,'msg'=>'Something went wrong.','number'=>'','result'=>$jsondata);
					}
				}else{
					$response = array('status' =>false,'msg'=>'No data found.','number'=>'','result'=>$jsondata);
				}
				
			}else{
				$response = array('status' =>false,'msg'=>'Something went wrong.','number'=>'','result'=>$jsondata);
			}
			echo json_encode($response, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
		}
		//,GROUP_CONCAT(DISTINCT result_hash.hashs_result SEPARATOR ',')
		// function get_result_records(){
		// 	header('Content-Type: application/json');
		// 	if($this->input->is_ajax_request() && $this->input->post()){
		// 		$last_result_id = $this->input->post('last_result_id');			
		// 		$this->db->select("result.result_id,result.result_serial_no,result.result_number,result.result_time, DATE_FORMAT(result.created_date_time,'%H:%i:%s') as created_time,result.created_date_time");
		// 		$this->db->from('result');
		// 		$this->db->join('result_hash','result.result_id = result_hash.result_id','right');
						
		// 		if($last_result_id > 0){	
		// 			$this->db->where('result.result_id',$last_result_id);
		// 		}				
		// 		$this->db->group_by("result.result_id");
		// 		$this->db->order_by("result.result_id","desc");

		// 		$this->db->limit(100,0);				
		// 		$query = $this->db->get();
		// 		if($query->num_rows()>0){					
		// 			$response = array('status' =>True,'msg'=>'Records found','result'=>$query->result_array());
		// 		}else{
		// 			$response = array('status' =>false,'msg'=>'No Result found.');
		// 		}
		// 	}else{
		// 		$response = array('status' =>false,'msg'=>'Something went wrong.');
		// 	}
		// 	echo json_encode($response, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
		// }


		function get_result_records(){
			header('Content-Type: application/json');
			if($this->input->is_ajax_request() && $this->input->post()){
				$last_result_id = $this->input->post('last_result_id');			
				$this->db->select("result_id,result_serial_no,result_number,result_time, DATE_FORMAT(created_date_time,'%H:%i:%s') as created_time,created_date_time");
				$this->db->from('result');			
				if($last_result_id > 0){	
					$this->db->where('result_id',$last_result_id);
				}				
				$this->db->order_by("result_id","desc");
				$this->db->limit(100,0);				
				$query = $this->db->get();
				if($query->num_rows()>0){					
					$response = array('status' =>True,'msg'=>'Records found','result'=>$query->result_array());
				}else{
					$response = array('status' =>false,'msg'=>'No Result found.');
				}
			}else{
				$response = array('status' =>false,'msg'=>'Something went wrong.');
			}
			echo json_encode($response, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
		}


		public function get_last_serial_no()
		{   
			$last_serial_no = $this->Lottery_Modal->get_last_serial_no();
			foreach($last_serial_no as $last_no){
			  echo $last = $last_no['result_serial_no'];
			}
		}	
		
		// public function get_winner()
		// {   
		// 	header('Content-Type: application/json');
		// 	//$sql = $this->db->query('SELECT winner.*,bat_numbers.bat_id,bat_numbers.bets_type,GROUP_CONCAT(bat_numbers.bat_numbers) as  lotter_numbers  FROM bat_numbers INNER JOIN winner ON bat_numbers.bat_id = winner.bat_id GROUP BY bat_numbers.bat_id ORDER BY winner_id DESC');
		// 	$sql = $this->db->query('SELECT winner.*,bats.bat_sequence_no FROM bats INNER JOIN winner ON bats.bat_id = winner.bat_id ORDER BY winner_id DESC');
		// 	$result = $sql->result_array();
		// 	echo json_encode(array("result"=>$result));
		// }

		public function get_bat()
		{   
			header('Content-Type: application/json');
			$last_id = $this->input->post('last_bat_id');
			if($last_id > 0){
				$nextid = $last_id+1;
				$sql = $this->db->query('SELECT * FROM betSummery where id >'.$last_id.' ORDER BY id DESC');
			}
			else{
				$sql = $this->db->query('SELECT * FROM betSummery ORDER BY id DESC');
			}
			
			//$sql = $this->db->query('SELECT winner.*,bat_numbers.bat_id,bat_numbers.bets_type,GROUP_CONCAT(bat_numbers.bat_numbers) as  lotter_numbers  FROM bat_numbers INNER JOIN winner ON bat_numbers.bat_id = winner.bat_id GROUP BY bat_numbers.bat_id ORDER BY winner_id DESC');
			
			$result = $sql->result_array();
			echo json_encode(array("result"=>$result));
		}

	public function userlogin(){
			$account = $this->input->post('account');
			$name = $this->input->post('name');	 
			
			if($account != null && $name != null){
			$data_array = array('username'=>$name,'wallet_address'=>$account);
			$select_login_data = $this->Lottery_Modal->select_data_where('user_wallets',$data_array);
			
			foreach($select_login_data as $login_data){
							$logger_name  = $login_data['username'];
							$login_wallet_address  = $login_data['wallet_address'];
			}
			if(count($select_login_data)==1){
				$session_data = array("account"=>$login_wallet_address,"name"=>$logger_name);
				$this->session->set_userdata('session_data',$session_data); //Sets the session
				echo "success";
			}
			else{
				$insert_user_data = $this->Lottery_Modal->insert_funtion('user_wallets', $data_array);
					if($insert_user_data==true){
						$session_data = array("account"=>$account,"name"=>$name);
						$this->session->set_userdata('session_data',$session_data); //Sets the session
						echo "success";
					}
					else{
						echo "false";
					}

			}
			}
			else{
				echo "please input your name Or login with metamsk wallet.";
			}
	}

	public function wallet_login(){
		// $wallet_address = $this->input->post('wallet_address');
		$wallet_email = $this->input->post('wallet_email');
		$wallet_password = $this->input->post('wallet_password');	 
		
		if($wallet_email != null && $wallet_password != null){
				$where_array = array('user_email_id'=>$wallet_email,'password'=>$wallet_password);
				$select_wallet_data = $this->Lottery_Modal->select_data_where('user_wallets',$where_array);
				
			 $user_cookie = array(
					'name'   => 'user_email',
					'value'  => $wallet_email,
					'expire' => '100000',
			 );
			 $password_cookie = array(
					'name'   => 'user_password',
					'value'  => $wallet_password,
					'expire' => '100000',
			 );
       $this->input->set_cookie($user_cookie,$password_cookie);    

				foreach($select_wallet_data as $wallet_data){
						 $walleter_username  = $wallet_data['username'];
						 $walleter_email  = $wallet_data['user_email_id'];
						 $walleter_password  = $wallet_data['password'];
						 $walleter_address  = $wallet_data['wallet_address'];
						 $walleter_private_key  = $wallet_data['wallet_private_key'];
				}
				if(count($select_wallet_data)==1){
						$session_data = array("email"=>$walleter_email,"account"=>$walleter_address,"name"=>$walleter_username,"password"=>$walleter_username,"private_key"=>$walleter_private_key);
		        $this->session->set_userdata('session_data',$session_data); //Sets the session
						echo "success";
        }else{
					echo "Please insert a valid email and password.";
				}
		 }
	}

	public function create_wallet(){
		$walleter_name = $this->input->post('wallet_name');
		$walleter_email = $this->input->post('wallet_email');
		$walleter_password = $this->input->post('wallet_password');	
		$walleter_address = $this->input->post('wallet_address');
		$walleter_private_key = $this->input->post('wallet_private_key');
		
		$recaptchaResponse = trim($this->input->post('g-recaptcha-response'));
		
        $userIp=$this->input->ip_address();
     
        $secret = $this->config->item('google_secret');
   
        $url="https://www.google.com/recaptcha/api/siteverify?secret=".$secret."&response=".$recaptchaResponse."&remoteip=".$userIp;
 
        $ch = curl_init(); 
        curl_setopt($ch, CURLOPT_URL, $url); 
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1); 
        $output = curl_exec($ch); 
        curl_close($ch);      
         
        $status= json_decode($output, true);
        if ($status['success']==1) {
         if($walleter_name != null && $walleter_email !=null && $walleter_password != null ){
				$wallet_data_array = array('username'=>$walleter_name,'user_email_id'=>$walleter_email,'password'=>$walleter_password,'wallet_address'=>$walleter_address,'wallet_private_key'=>$walleter_private_key);
				$insert_wallet_data = $this->Lottery_Modal->insert_funtion('user_wallets', $wallet_data_array);
				if($insert_wallet_data==true){
                    $mailsend = $this->create_wallet_mail($walleter_name,$walleter_email,$walleter_password,$walleter_address,$walleter_private_key);
					echo "success";
        }
				else{
					echo "false";
				}
	   	}
	 }
	 else{
		echo 'captchaerror';
	   }
	}
	


	public function get_private_key(){
		$walletrraddress  =	$this->input->post('wallet_address');
		$walletrrpassword =	$this->input->post('wallet_password');
		
		if($walletrraddress !=null && $walletrrpassword !=null){
			$select_array = array('wallet_address'=>$walletrraddress,'password'=>$walletrrpassword);
			$select_walletter_data = $this->Lottery_Modal->select_data_where('user_wallets',$select_array);
				
			foreach($select_walletter_data as $get_private_key){
					$walleter_private_key  = $get_private_key['wallet_private_key'];
			}
			if(count($walleter_private_key)==1){
				echo $walleter_private_key;
			}
			else{
				echo "private Key Not Found";
			}
		}
		else{
			echo "please input valid Password";
		}
	}

	public function get_password(){
		$forgetor_email  =	$this->input->post('forgetor_email');
		
		if($forgetor_email !=null){
			$select_forget_array = array('user_email_id'=>$forgetor_email);
			$select_forgetor_data = $this->Lottery_Modal->select_data_where('user_wallets',$select_forget_array);
				
			foreach($select_forgetor_data as $get_forgeter_data){
				$forgetor_email  = $get_forgeter_data['user_email_id'];	
				$forgetor_password  = $get_forgeter_data['password'];
			}
			if(!empty($forgetor_password)){
				$this->load->library('email');
		    $this->email->set_header('MIME-Version', '1.0; charset=utf-8');
        $this->email->set_header('Content-type', 'text/html');
				$config = array();
				$config['protocol'] = 'smtp';
				$config['mailtype'] = 'html';
				$config['charset'] = 'utf-8';
				$config['smtp_host'] = 'mail.pinesucceed.com'; 
				$config['smtp_user'] = 'virendra_0012@pinesucceed.com';
				$config['smtp_pass'] = 'Virendra@123';
				$config['smtp_port'] = 587; //   25
		
		
		    $this->email->initialize($config);
        $this->email->set_newline("\r\n");
		    $from_email = "virendra_0012@pinesucceed.com";
        $to_email = $forgetor_email;
        $this->email->from($from_email, 'Eth play');
        $this->email->to($to_email);
        $this->email->subject('Your Password.');
        $this->email->message('Hi '.$forgetor_email.'<br>Your Password is: <b>'.$forgetor_password.'</b><br>
		                       To start betting, please click this link.
		                       <a href="http://demo.ethplay.io/">Click Here For Bet</a>');
        if($this->email->send()){
						echo "Password Send to your email-id";
				}else{
            echo "Mail sending error.";
        }
      }
			else{
				echo "dont found email id please try again";
			}
		}
		else{
			echo "please input valid email id";
		}
	}
	
	public function create_wallet_mail($username,$useremail,$userpassword,$useraddress,$userprivate_key){
		//Load email library
		$this->load->library('email');
		$this->email->set_header('MIME-Version', '1.0; charset=utf-8');
        $this->email->set_header('Content-type', 'text/html');
		 $config = array();
		 $config['protocol'] = 'smtp';
		 $config['mailtype'] = 'html';
		 $config['charset'] = 'utf-8';
		 $config['smtp_host'] = 'mail.pinesucceed.com'; 
     $config['smtp_user'] = 'virendra_0012@pinesucceed.com';
     $config['smtp_pass'] = 'Virendra@123';
		 $config['smtp_port'] = 587;
		//   25
		
		$this->email->initialize($config);
        $this->email->set_newline("\r\n");
		$from_email = "virendra_0012@pinesucceed.com";
        $to_email = $useremail;
        $this->email->from($from_email, 'Eth play');
        $this->email->to($to_email);
        $this->email->subject('Your account has been created.');
        $this->email->message('Hi '.$username.'<br>Thank you for registering at ETHPlay.io
                               This is your wallet address:'.$useraddress.'
		                       To start betting, please deposit Ether to your wallet address.
		                       <a href="http://demo.ethplay.io/">Click Here For Bet</a>');
        if($this->email->send()){
            return true;
        }else{
            return false;
       }
	}

	public function withdrawAmount(){
	  $withdraw_address =	$this->input->post('withdraw_address');
		$withdraw_amount =	$this->input->post('withdraw_amount');
		
		if($withdraw_address!=null && $withdraw_amount!=null){
			$withdraw_array = array('withdraw_address'=>$withdraw_address,'withdraw_amount'=>$withdraw_amount);
			$insert_withdraw_data = $this->Lottery_Modal->insert_funtion('withdraw', $withdraw_array);
				if($insert_withdraw_data==true){
                    echo "success";
                }
				else{
					echo "false";
				}
		}
	}

	function get_login_win_bats(){
		if($this->input->is_ajax_request() && $this->input->post()):
			$loginId = $this->input->post('loginid');
			$query = $this->db->query("SELECT * from betSummery where userId='$loginId'  ORDER BY id DESC limit 100");
			if($query->num_rows()>0):
				header('Content-Type: application/json');
				echo json_encode(array("stat"=>true,'msg'=>'Data found','result'=>$query->result()));
			else:
				header('Content-Type: application/json');
				echo json_encode(array("stat"=>false,'msg'=>'No data found'));
			endif;
		else:
			header('Content-Type: application/json');
			echo json_encode(array("stat"=>false,'msg'=>'Invalid Method'));
		endif;
	}

	function get_hash(){
		if($this->input->is_ajax_request() && $this->input->post()):
			$result_id = $this->input->post('result_id');
			$query = $this->db->query("SELECT * from result_hash where result_id='$result_id'  ORDER BY hash_id DESC limit 5");
			if($query->num_rows()>0):
				header('Content-Type: application/json');
				echo json_encode(array("stat"=>true,'msg'=>'Data found','result'=>$query->result()));
			else:
				header('Content-Type: application/json');
				echo json_encode(array("stat"=>false,'msg'=>'No data found'));
			endif;
		else:
			header('Content-Type: application/json');
			echo json_encode(array("stat"=>false,'msg'=>'Invalid Method'));
		endif;
	}

  function check_bet(){
		if($this->input->is_ajax_request() && $this->input->post()){
			
			$walletaddress  =	$this->input->post('account');
		  $betSequenceno =	$this->input->post('bet_sequence_no');
			
			if($walletaddress !=null && $betSequenceno !=null){
			$sql = $this->db->query("SELECT * FROM bats where bat_login_id ='$walletaddress' AND bat_sequence_no ='$betSequenceno'");
			echo $result = $sql->num_rows();
			}
			else{
				echo "not_found";
			}
	  } 
  }
}



